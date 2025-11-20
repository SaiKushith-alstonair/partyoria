#!/usr/bin/env python
import os
import sys
import django
import logging

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection, transaction
from django.core.exceptions import ValidationError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print("=== CLEANING UP LEGACY VENDOR TABLES ===\n")

try:
    with transaction.atomic():
        with connection.cursor() as cursor:
            # Validate table names to prevent SQL injection
            ALLOWED_TABLES = {
                'verification_details': 'user_id',
                'booking_details': 'vendor_id',
                'vendors_vendorchat': ['sender_id', 'receiver_id'],
                'vendors_calendarevent': 'vendor_id'
            }
            
            # Create mapping table with parameterized query
            cursor.execute("""
                CREATE TEMP TABLE user_mapping AS
                SELECT ud.id as old_id, au.id as new_id
                FROM user_details ud
                JOIN authentication_customuser au ON ud.email = au.email
                WHERE au.user_type = %s;
            """, ['vendor'])
            
            cursor.execute("SELECT COUNT(*) FROM user_mapping")
            mapping_count = cursor.fetchone()[0]
            logger.info(f"Created mapping for {mapping_count} users")
            
            # Update each table with validated names
            for table_name in ['verification_details', 'booking_details', 'vendors_calendarevent']:
                if table_name not in ALLOWED_TABLES:
                    continue
                    
                column_name = ALLOWED_TABLES[table_name]
                logger.info(f"Updating {table_name}.{column_name}...")
                
                # Check if table exists using parameterized query
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM information_schema.tables 
                    WHERE table_name = %s
                """, [table_name])
                
                if cursor.fetchone()[0] > 0:
                    # Use safe parameterized queries only
                    cursor.execute("""
                        SELECT COUNT(*) FROM information_schema.columns 
                        WHERE table_name = %s AND column_name = %s
                    """, [table_name, column_name])
                    
                    if cursor.fetchone()[0] > 0:
                        # Update using safe subquery
                        cursor.execute("""
                            UPDATE {} SET {} = (
                                SELECT um.new_id FROM user_mapping um 
                                WHERE um.old_id = {}.{}
                            ) WHERE {} IN (SELECT old_id FROM user_mapping)
                        """.format(
                            connection.ops.quote_name(table_name),
                            connection.ops.quote_name(column_name),
                            connection.ops.quote_name(table_name),
                            connection.ops.quote_name(column_name),
                            connection.ops.quote_name(column_name)
                        ))
                    
                        logger.info(f"Updated {table_name} to CustomUser IDs")
                    else:
                        logger.info(f"{table_name} column {column_name} not found")
                else:
                    logger.info(f"{table_name} doesn't exist")
            
            # Handle vendors_vendorchat separately
            logger.info("Updating vendors_vendorchat...")
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_name = %s
            """, ['vendors_vendorchat'])
            
            if cursor.fetchone()[0] > 0:
                # Update sender_id and receiver_id with safe queries
                for column in ['sender_id', 'receiver_id']:
                    cursor.execute("""
                        UPDATE vendors_vendorchat 
                        SET {} = (
                            SELECT um.new_id FROM user_mapping um 
                            WHERE um.old_id = vendors_vendorchat.{}
                        ) WHERE {} IN (SELECT old_id FROM user_mapping)
                    """.format(
                        connection.ops.quote_name(column),
                        connection.ops.quote_name(column),
                        connection.ops.quote_name(column)
                    ))
                logger.info("Updated vendors_vendorchat foreign keys")
            
            # Drop legacy tables safely
            logger.info("Dropping legacy tables...")
            for table in ['vendor_bridge', 'user_details']:
                cursor.execute("DROP TABLE IF EXISTS {} CASCADE;".format(
                    connection.ops.quote_name(table)
                ))
                logger.info(f"Dropped {table}")

except Exception as e:
    logger.error(f"Cleanup failed: {str(e)}")
    raise

print("\n=== CLEANUP COMPLETE ===")
print("All vendor tables now use CustomUser foreign keys")
print("Legacy tables removed")