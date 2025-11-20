from django.core.management.base import BaseCommand
from authentication.models import CustomUser
from django.db import transaction
from django.db import models

class Command(BaseCommand):
    help = 'Fix duplicate users in the database'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Find duplicate emails
            duplicates = CustomUser.objects.values('email').annotate(
                count=models.Count('email')
            ).filter(count__gt=1)
            
            for duplicate in duplicates:
                email = duplicate['email']
                users = CustomUser.objects.filter(email=email).order_by('id')
                
                # Keep the first user, delete the rest
                users_to_delete = users[1:]
                for user in users_to_delete:
                    self.stdout.write(f'Deleting duplicate user: {user.email} (ID: {user.id})')
                    user.delete()
                
                self.stdout.write(f'Kept user: {users.first().email} (ID: {users.first().id})')
            
            self.stdout.write(self.style.SUCCESS('Successfully fixed duplicate users'))