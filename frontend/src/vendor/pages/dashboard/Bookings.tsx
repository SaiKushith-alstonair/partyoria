import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import VendorBookings from "../../components/VendorBookings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Search, Check, X, Eye, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getVerificationStatus } from "../../utils/verificationUtils";
import { apiService } from "../../services/api";


const getBookingsByProfession = (profession: string) => {
  const allBookings = {
    "Photography": [
      { id: 1, customer: "Sarah Johnson", service: "Wedding Photography", date: "2025-10-15", amount: "₹2,500", status: "pending", phone: "+1 234-567-8901", email: "sarah.johnson@email.com", location: "Central Park, NYC", time: "10:00 AM - 6:00 PM", guests: 150, min_people: 100, max_people: 200, notes: "Outdoor wedding ceremony with 150 guests. Need both ceremony and reception coverage." },
      { id: 2, customer: "Mike Chen", service: "Corporate Photography", date: "2025-10-08", amount: "₹1,800", status: "in_progress", phone: "+1 234-567-8902", email: "mike.chen@company.com", location: "Downtown Office Building", time: "9:00 AM - 5:00 PM", guests: 20, min_people: 15, max_people: 30, notes: "Corporate headshots for 20 employees. Professional attire required." },
      { id: 3, customer: "Emma Wilson", service: "Birthday Photography", date: "2025-10-22", amount: "₹1,200", status: "pending", phone: "+1 234-567-8903", email: "emma.wilson@email.com", location: "Private Residence", time: "2:00 PM - 6:00 PM", guests: 15, min_people: 10, max_people: 25, notes: "5-year-old birthday party with family and friends. Fun, candid shots preferred." },
      { id: 4, customer: "James Brown", service: "Event Photography", date: "2025-11-03", amount: "₹2,000", status: "completed", phone: "+1 234-567-8904", email: "james.brown@email.com", location: "Grand Hotel Ballroom", time: "6:00 PM - 11:00 PM", guests: 200, min_people: 150, max_people: 250, notes: "Corporate gala event with 200 attendees. Focus on networking and award ceremony." },
      { id: 5, customer: "Olivia Davis", service: "Portrait Session", date: "2025-11-10", amount: "₹800", status: "in_progress", phone: "+1 234-567-8905", email: "olivia.davis@email.com", location: "Studio Downtown", time: "11:00 AM - 1:00 PM", guests: 1, min_people: 1, max_people: 3, notes: "Professional headshots for LinkedIn and business cards. Clean, modern style." },
    ],
    "Catering": [
      { id: 6, customer: "Emily Davis", service: "Birthday Catering", date: "2025-10-20", amount: "₹850", status: "pending", phone: "+1 234-567-8906", email: "emily.davis@email.com", location: "Community Center", time: "12:00 PM - 4:00 PM", guests: 25, min_people: 20, max_people: 35, notes: "25 guests, vegetarian options required. Birthday cake included." },
      { id: 7, customer: "John Williams", service: "Wedding Catering", date: "2025-10-25", amount: "₹2,800", status: "completed", phone: "+1 234-567-8907", email: "john.williams@email.com", location: "Garden Venue", time: "5:00 PM - 11:00 PM", guests: 150, min_people: 120, max_people: 180, notes: "150 guests, 3-course dinner with dietary restrictions accommodated." },
      { id: 8, customer: "Alex Martinez", service: "Corporate Lunch", date: "2025-11-01", amount: "₹1,500", status: "pending", phone: "+1 234-567-8908", email: "alex.martinez@company.com", location: "Office Conference Room", time: "12:00 PM - 2:00 PM", guests: 30, min_people: 25, max_people: 40, notes: "Business lunch for 30 people. Professional presentation required." },
      { id: 9, customer: "Sophie Taylor", service: "Anniversary Dinner", date: "2025-11-07", amount: "₹1,200", status: "in_progress", phone: "+1 234-567-8909", email: "sophie.taylor@email.com", location: "Private Dining Room", time: "7:00 PM - 10:00 PM", guests: 12, notes: "Intimate dinner for 12 people. Romantic atmosphere preferred." },
      { id: 10, customer: "Ryan Clark", service: "Holiday Party Catering", date: "2025-12-15", amount: "₹3,200", status: "pending", phone: "+1 234-567-8910", email: "ryan.clark@email.com", location: "Corporate Office", time: "6:00 PM - 10:00 PM", guests: 80, notes: "Holiday party for 80 employees. Festive menu with appetizers and desserts." },
    ],
    "DJ": [
      { id: 11, customer: "Robert Smith", service: "Wedding DJ", date: "2025-10-12", amount: "₹1,500", status: "in_progress", phone: "+1 234-567-8911", email: "robert.smith@email.com", location: "Riverside Venue", time: "7:00 PM - 12:00 AM", guests: 120, min_people: 80, max_people: 150, notes: "Wedding reception for 120 guests. Mix of classic and modern music requested." },
      { id: 12, customer: "Lisa Anderson", service: "Corporate DJ", date: "2025-11-05", amount: "₹1,200", status: "pending", phone: "+1 234-567-8912", email: "lisa.anderson@company.com", location: "Convention Center", time: "6:00 PM - 10:00 PM", guests: 100, min_people: 75, max_people: 125, notes: "Corporate party with background music and announcements. Professional setup required." },
      { id: 13, customer: "Mark Johnson", service: "Birthday Party DJ", date: "2025-10-28", amount: "₹800", status: "completed", phone: "+1 234-567-8913", email: "mark.johnson@email.com", location: "Community Hall", time: "3:00 PM - 8:00 PM", guests: 25, notes: "16th birthday party. Teen-friendly music and interactive games." },
      { id: 14, customer: "Rachel Green", service: "Club Event DJ", date: "2025-11-12", amount: "₹2,000", status: "pending", phone: "+1 234-567-8914", email: "rachel.green@email.com", location: "Downtown Club", time: "9:00 PM - 2:00 AM", guests: 150, notes: "High-energy club night. Electronic and dance music focus." },
      { id: 15, customer: "Kevin White", service: "School Dance DJ", date: "2025-11-20", amount: "₹600", status: "in_progress", phone: "+1 234-567-8915", email: "kevin.white@school.edu", location: "School Gymnasium", time: "7:00 PM - 11:00 PM", guests: 200, notes: "High school dance. Clean music only, no explicit content." },
    ],
    "Decoration": [
      { id: 16, customer: "Anna Wilson", service: "Birthday Decoration", date: "2025-10-18", amount: "₹650", status: "pending", phone: "+1 234-567-8916", email: "anna.wilson@email.com", location: "Backyard Party Area", time: "10:00 AM - 2:00 PM", guests: 20, notes: "Princess theme for 7-year-old. Pink and gold color scheme with balloons and banners." },
      { id: 17, customer: "Tom Brown", service: "Wedding Decoration", date: "2025-11-02", amount: "₹1,800", status: "in_progress", phone: "+1 234-567-8917", email: "tom.brown@email.com", location: "Garden Wedding Venue", time: "8:00 AM - 6:00 PM", guests: 120, notes: "Rustic outdoor wedding. Natural flowers, wooden accents, and string lights." },
      { id: 18, customer: "Maya Patel", service: "Baby Shower Decoration", date: "2025-10-30", amount: "₹500", status: "completed", phone: "+1 234-567-8918", email: "maya.patel@email.com", location: "Private Home", time: "11:00 AM - 3:00 PM", guests: 25, notes: "Gender-neutral baby shower. Soft pastels with teddy bear theme." },
      { id: 19, customer: "Chris Lee", service: "Corporate Event Decoration", date: "2025-11-15", amount: "₹1,200", status: "pending", phone: "+1 234-567-8919", email: "chris.lee@company.com", location: "Corporate Headquarters", time: "9:00 AM - 5:00 PM", guests: 150, notes: "Annual company meeting. Professional setup with branded materials and modern design." },
      { id: 20, customer: "Nina Rodriguez", service: "Anniversary Decoration", date: "2025-11-25", amount: "₹900", status: "in_progress", phone: "+1 234-567-8920", email: "nina.rodriguez@email.com", location: "Restaurant Private Room", time: "5:00 PM - 9:00 PM", guests: 30, notes: "25th wedding anniversary. Elegant silver and white theme with romantic lighting." },
    ],
    "Event Manager": [
      { id: 21, customer: "David Lee", service: "Corporate Event Planning", date: "2025-10-22", amount: "₹3,500", status: "pending", phone: "+1 234-567-8921", email: "david.lee@company.com", location: "Business Conference Center", time: "8:00 AM - 6:00 PM", guests: 200, notes: "Annual corporate retreat for 200 employees. Team building activities and presentations." },
      { id: 22, customer: "Maria Garcia", service: "Wedding Planning", date: "2025-11-08", amount: "₹4,000", status: "completed", phone: "+1 234-567-8922", email: "maria.garcia@email.com", location: "Beachside Resort", time: "2:00 PM - 11:00 PM", guests: 80, notes: "Destination wedding for 80 guests. Full coordination from ceremony to reception." },
      { id: 23, customer: "Steven Adams", service: "Conference Planning", date: "2025-11-18", amount: "₹2,800", status: "in_progress", phone: "+1 234-567-8923", email: "steven.adams@organization.org", location: "Hotel Conference Center", time: "7:00 AM - 7:00 PM", guests: 300, notes: "Medical conference with 300 attendees. AV equipment and catering coordination required." },
      { id: 24, customer: "Jessica Miller", service: "Birthday Party Planning", date: "2025-12-05", amount: "₹1,500", status: "pending", phone: "+1 234-567-8924", email: "jessica.miller@email.com", location: "Event Hall", time: "1:00 PM - 6:00 PM", guests: 50, notes: "Sweet 16 party for 50 guests. DJ, catering, and decoration coordination needed." },
      { id: 25, customer: "Daniel Wilson", service: "Charity Event Planning", date: "2025-12-12", amount: "₹2,200", status: "pending", phone: "+1 234-567-8925", email: "daniel.wilson@charity.org", location: "Community Center", time: "6:00 PM - 10:00 PM", guests: 150, notes: "Fundraising gala for 150 guests. Silent auction and dinner coordination required." },
    ],
    "Transportation": [
      { id: 26, customer: "Michael Brown", service: "Wedding Transportation", date: "2025-10-20", amount: "₹800", status: "pending", phone: "+1 234-567-8926", email: "michael.brown@email.com", location: "City Center", time: "2:00 PM - 8:00 PM", guests: 8, notes: "Luxury car rental for bridal party. 3 vehicles needed." },
      { id: 27, customer: "Patricia Wilson", service: "Airport Transfer", date: "2025-11-03", amount: "₹150", status: "completed", phone: "+1 234-567-8927", email: "patricia.wilson@email.com", location: "Downtown Hotel", time: "6:00 AM - 8:00 AM", guests: 1, notes: "Executive transport to airport. Premium sedan required." },
      { id: 28, customer: "Carlos Rodriguez", service: "Corporate Transport", date: "2025-11-12", amount: "₹600", status: "in_progress", phone: "+1 234-567-8928", email: "carlos.rodriguez@company.com", location: "Business District", time: "8:00 AM - 6:00 PM", guests: 3, notes: "Daily transport for visiting executives. 5-day service." },
      { id: 29, customer: "Amanda Foster", service: "Party Bus Rental", date: "2025-11-20", amount: "₹1,200", status: "pending", phone: "+1 234-567-8929", email: "amanda.foster@email.com", location: "Entertainment District", time: "7:00 PM - 2:00 AM", guests: 15, notes: "Bachelor party transportation. 15 passengers, music system required." },
      { id: 30, customer: "Robert Chen", service: "Event Shuttle", date: "2025-12-01", amount: "₹900", status: "pending", phone: "+1 234-567-8930", email: "robert.chen@email.com", location: "Convention Center", time: "9:00 AM - 5:00 PM", guests: 50, notes: "Conference attendee shuttle service. Multiple pickup points." },
    ],
    "Florist": [
      { id: 31, customer: "Jennifer Davis", service: "Wedding Flowers", date: "2025-10-25", amount: "₹1,500", status: "pending", phone: "+1 234-567-8931", email: "jennifer.davis@email.com", location: "Garden Venue", time: "9:00 AM - 3:00 PM", guests: 100, notes: "Bridal bouquet, centerpieces, and ceremony arch. White roses and eucalyptus." },
      { id: 32, customer: "Thomas Anderson", service: "Corporate Arrangements", date: "2025-11-05", amount: "₹800", status: "in_progress", phone: "+1 234-567-8932", email: "thomas.anderson@company.com", location: "Office Lobby", time: "8:00 AM - 10:00 AM", guests: 50, notes: "Weekly fresh flower arrangements for corporate office. Modern, minimalist style." },
      { id: 33, customer: "Maria Santos", service: "Funeral Arrangements", date: "2025-10-30", amount: "₹600", status: "completed", phone: "+1 234-567-8933", email: "maria.santos@email.com", location: "Funeral Home", time: "2:00 PM - 4:00 PM", guests: 75, notes: "Sympathy arrangements and casket spray. White lilies and chrysanthemums." },
      { id: 34, customer: "Lisa Park", service: "Birthday Flowers", date: "2025-11-15", amount: "₹300", status: "pending", phone: "+1 234-567-8934", email: "lisa.park@email.com", location: "Private Residence", time: "11:00 AM - 1:00 PM", guests: 18, notes: "Colorful birthday arrangements for surprise party. Bright, cheerful flowers." },
      { id: 35, customer: "David Kim", service: "Anniversary Bouquet", date: "2025-11-22", amount: "₹250", status: "pending", phone: "+1 234-567-8935", email: "david.kim@email.com", location: "Restaurant", time: "6:00 PM - 7:00 PM", guests: 2, notes: "25th anniversary surprise. Red roses with baby's breath." },
    ],
    "Baker": [
      { id: 36, customer: "Lisa Martinez", service: "Wedding Cake", date: "2025-10-30", amount: "₹800", status: "pending", phone: "+1 234-567-8936", email: "lisa.martinez@email.com", location: "Reception Hall", time: "4:00 PM - 6:00 PM", guests: 80, notes: "3-tier vanilla cake with buttercream frosting. Elegant white design." },
      { id: 37, customer: "James Wilson", service: "Birthday Cake", date: "2025-11-08", amount: "₹150", status: "completed", phone: "+1 234-567-8937", email: "james.wilson@email.com", location: "Community Center", time: "2:00 PM - 3:00 PM", guests: 15, notes: "Superhero themed cake for 8-year-old. Chocolate cake with fondant decorations." },
      { id: 38, customer: "Sarah Thompson", service: "Corporate Desserts", date: "2025-11-12", amount: "₹400", status: "in_progress", phone: "+1 234-567-8938", email: "sarah.thompson@company.com", location: "Office Conference Room", time: "1:00 PM - 2:00 PM", guests: 50, notes: "Assorted cupcakes and cookies for company meeting. 50 pieces total." },
      { id: 39, customer: "Michael Garcia", service: "Anniversary Cake", date: "2025-11-20", amount: "₹300", status: "pending", phone: "+1 234-567-8939", email: "michael.garcia@email.com", location: "Private Home", time: "5:00 PM - 6:00 PM", guests: 20, notes: "Golden anniversary cake. 2-tier lemon cake with cream cheese frosting." },
      { id: 40, customer: "Emily Rodriguez", service: "Baby Shower Treats", date: "2025-12-03", amount: "₹250", status: "pending", phone: "+1 234-567-8940", email: "emily.rodriguez@email.com", location: "Event Hall", time: "12:00 PM - 1:00 PM", guests: 30, notes: "Gender reveal themed cupcakes and cookies. Pink and blue decorations." },
    ],
    "Videography": [
      { id: 41, customer: "Amanda Taylor", service: "Wedding Videography", date: "2025-11-02", amount: "₹2,200", status: "pending", phone: "+1 234-567-8941", email: "amanda.taylor@email.com", location: "Beach Resort", time: "12:00 PM - 10:00 PM", guests: 90, notes: "Cinematic wedding video with drone footage. Ceremony and reception coverage." },
      { id: 42, customer: "Robert Johnson", service: "Corporate Video", date: "2025-10-28", amount: "₹1,800", status: "in_progress", phone: "+1 234-567-8942", email: "robert.johnson@company.com", location: "Corporate Headquarters", time: "9:00 AM - 5:00 PM", guests: 25, notes: "Company promotional video. Interviews with executives and facility tour." },
      { id: 43, customer: "Jessica Brown", service: "Event Documentation", date: "2025-11-15", amount: "₹1,200", status: "completed", phone: "+1 234-567-8943", email: "jessica.brown@email.com", location: "Convention Center", time: "8:00 AM - 6:00 PM", guests: 250, notes: "Conference highlights video. Key presentations and networking sessions." },
      { id: 44, customer: "Daniel Lee", service: "Birthday Video", date: "2025-11-25", amount: "₹600", status: "pending", phone: "+1 234-567-8944", email: "daniel.lee@email.com", location: "Private Residence", time: "3:00 PM - 7:00 PM", guests: 35, notes: "Sweet 16 party video. Candid moments and party highlights." },
      { id: 45, customer: "Michelle Davis", service: "Music Video", date: "2025-12-10", amount: "₹2,500", status: "pending", phone: "+1 234-567-8945", email: "michelle.davis@email.com", location: "Recording Studio", time: "10:00 AM - 8:00 PM", guests: 10, notes: "Professional music video production. Multiple locations and creative shots." },
    ],
    "Makeup Artist": [
      { id: 46, customer: "Rachel Green", service: "Bridal Makeup", date: "2025-10-28", amount: "₹400", status: "pending", phone: "+1 234-567-8946", email: "rachel.green@email.com", location: "Bridal Suite", time: "8:00 AM - 12:00 PM", guests: 1, notes: "Bridal makeup with trial session. Natural, elegant look requested." },
      { id: 47, customer: "Sophia Martinez", service: "Photoshoot Makeup", date: "2025-11-05", amount: "₹300", status: "completed", phone: "+1 234-567-8947", email: "sophia.martinez@email.com", location: "Photography Studio", time: "9:00 AM - 1:00 PM", guests: 1, notes: "Professional headshot makeup. Corporate and glamour looks." },
      { id: 48, customer: "Isabella Wilson", service: "Prom Makeup", date: "2025-11-12", amount: "₹150", status: "in_progress", phone: "+1 234-567-8948", email: "isabella.wilson@email.com", location: "Client's Home", time: "4:00 PM - 6:00 PM", guests: 1, notes: "Prom night makeup. Bold, glamorous look with long-lasting formula." },
      { id: 49, customer: "Olivia Johnson", service: "Special Event Makeup", date: "2025-11-20", amount: "₹250", status: "pending", phone: "+1 234-567-8949", email: "olivia.johnson@email.com", location: "Hotel Suite", time: "6:00 PM - 8:00 PM", guests: 1, notes: "Gala event makeup. Sophisticated evening look with contouring." },
      { id: 50, customer: "Emma Thompson", service: "Group Makeup", date: "2025-12-01", amount: "₹600", status: "pending", phone: "+1 234-567-8950", email: "emma.thompson@email.com", location: "Bridal Suite", time: "7:00 AM - 12:00 PM", guests: 4, notes: "Bridal party makeup for 4 people. Coordinated looks in soft pastels." },
    ],
    "Hair Stylist": [
      { id: 51, customer: "Emma Johnson", service: "Bridal Hairstyle", date: "2025-11-05", amount: "₹300", status: "pending", phone: "+1 234-567-8951", email: "emma.johnson@email.com", location: "Salon", time: "10:00 AM - 2:00 PM", guests: 1, notes: "Elegant updo with fresh flowers. Trial session included." },
      { id: 52, customer: "Grace Wilson", service: "Prom Hair", date: "2025-11-10", amount: "₹180", status: "completed", phone: "+1 234-567-8952", email: "grace.wilson@email.com", location: "Salon", time: "3:00 PM - 5:00 PM", guests: 1, notes: "Glamorous Hollywood waves with hair accessories." },
      { id: 53, customer: "Ava Martinez", service: "Photoshoot Styling", date: "2025-11-18", amount: "₹250", status: "in_progress", phone: "+1 234-567-8953", email: "ava.martinez@email.com", location: "Photography Studio", time: "8:00 AM - 12:00 PM", guests: 1, notes: "Multiple hairstyles for fashion shoot. Creative and editorial looks." },
      { id: 54, customer: "Chloe Davis", service: "Special Event Hair", date: "2025-11-25", amount: "₹200", status: "pending", phone: "+1 234-567-8954", email: "chloe.davis@email.com", location: "Client's Home", time: "5:00 PM - 7:00 PM", guests: 1, notes: "Anniversary dinner hairstyle. Sophisticated chignon with volume." },
      { id: 55, customer: "Mia Rodriguez", service: "Bridal Party Hair", date: "2025-12-08", amount: "₹500", status: "pending", phone: "+1 234-567-8955", email: "mia.rodriguez@email.com", location: "Bridal Suite", time: "8:00 AM - 1:00 PM", guests: 4, notes: "Hair styling for bride and 3 bridesmaids. Coordinated romantic styles." },
    ],
    "Fashion Designer": [
      { id: 56, customer: "Isabella Wilson", service: "Bridal Wear", date: "2025-12-01", amount: "₹2,500", status: "pending", phone: "+1 234-567-8956", email: "isabella.wilson@email.com", location: "Design Studio", time: "11:00 AM - 4:00 PM", guests: 1, notes: "Custom wedding dress design and fitting. Vintage lace with modern silhouette." },
      { id: 57, customer: "Sophia Chen", service: "Prom Dress", date: "2025-11-08", amount: "₹800", status: "in_progress", phone: "+1 234-567-8957", email: "sophia.chen@email.com", location: "Design Studio", time: "2:00 PM - 5:00 PM", guests: 1, notes: "Custom prom dress with beading and sequins. Royal blue color." },
      { id: 58, customer: "Victoria Brown", service: "Evening Gown", date: "2025-11-15", amount: "₹1,200", status: "completed", phone: "+1 234-567-8958", email: "victoria.brown@email.com", location: "Design Studio", time: "10:00 AM - 3:00 PM", guests: 1, notes: "Formal gala gown with train. Black silk with gold embellishments." },
      { id: 59, customer: "Natalie Garcia", service: "Bridesmaid Dresses", date: "2025-11-22", amount: "₹1,800", status: "pending", phone: "+1 234-567-8959", email: "natalie.garcia@email.com", location: "Design Studio", time: "1:00 PM - 6:00 PM", guests: 4, notes: "4 matching bridesmaid dresses in dusty rose. A-line silhouette." },
      { id: 60, customer: "Aria Johnson", service: "Cocktail Dress", date: "2025-12-05", amount: "₹600", status: "pending", phone: "+1 234-567-8960", email: "aria.johnson@email.com", location: "Design Studio", time: "3:00 PM - 5:00 PM", guests: 1, notes: "Cocktail party dress for corporate event. Professional yet stylish." },
    ],
    "Gift Services": [
      { id: 61, customer: "Grace Taylor", service: "Wedding Favors", date: "2025-10-22", amount: "₹500", status: "pending", phone: "+1 234-567-8961", email: "grace.taylor@email.com", location: "Event Venue", time: "3:00 PM - 5:00 PM", guests: 100, notes: "Personalized wedding favors for 100 guests. Mini succulents with custom tags." },
      { id: 62, customer: "Oliver Martinez", service: "Corporate Gifts", date: "2025-11-03", amount: "₹800", status: "completed", phone: "+1 234-567-8962", email: "oliver.martinez@company.com", location: "Office Building", time: "9:00 AM - 11:00 AM", guests: 20, notes: "Executive gift baskets for client appreciation. Premium items with branding." },
      { id: 63, customer: "Luna Davis", service: "Baby Shower Gifts", date: "2025-11-12", amount: "₹300", status: "in_progress", phone: "+1 234-567-8963", email: "luna.davis@email.com", location: "Private Home", time: "1:00 PM - 3:00 PM", guests: 25, notes: "Curated baby gift packages for shower guests. Gender-neutral themes." },
      { id: 64, customer: "Ethan Wilson", service: "Holiday Gifts", date: "2025-12-10", amount: "₹1,200", status: "pending", phone: "+1 234-567-8964", email: "ethan.wilson@email.com", location: "Corporate Office", time: "10:00 AM - 2:00 PM", guests: 50, notes: "Employee holiday gift packages. 50 custom gift boxes with treats." },
      { id: 65, customer: "Zoe Rodriguez", service: "Anniversary Gifts", date: "2025-11-28", amount: "₹400", status: "pending", phone: "+1 234-567-8965", email: "zoe.rodriguez@email.com", location: "Hotel Suite", time: "4:00 PM - 6:00 PM", guests: 2, notes: "Romantic anniversary gift setup. Champagne, chocolates, and flowers." },
    ],
    "Entertainment": [
      { id: 66, customer: "Charlotte Johnson", service: "Live Band", date: "2025-11-08", amount: "₹2,000", status: "pending", phone: "+1 234-567-8966", email: "charlotte.johnson@email.com", location: "Wedding Venue", time: "7:00 PM - 11:00 PM", guests: 110, notes: "4-piece jazz band for wedding reception. Mix of classics and contemporary." },
      { id: 67, customer: "Mason Brown", service: "DJ Services", date: "2025-10-30", amount: "₹800", status: "completed", phone: "+1 234-567-8967", email: "mason.brown@email.com", location: "Community Center", time: "6:00 PM - 11:00 PM", guests: 75, notes: "Halloween party DJ with costume contest and dance music." },
      { id: 68, customer: "Harper Wilson", service: "Magician", date: "2025-11-15", amount: "₹400", status: "in_progress", phone: "+1 234-567-8968", email: "harper.wilson@email.com", location: "Private Residence", time: "2:00 PM - 4:00 PM", guests: 12, notes: "Children's birthday party magic show. Interactive tricks for ages 5-10." },
      { id: 69, customer: "Logan Garcia", service: "Stand-up Comedy", date: "2025-11-22", amount: "₹600", status: "pending", phone: "+1 234-567-8969", email: "logan.garcia@email.com", location: "Corporate Event Hall", time: "8:00 PM - 9:30 PM", guests: 80, notes: "Clean comedy for corporate holiday party. Family-friendly material." },
      { id: 70, customer: "Avery Martinez", service: "String Quartet", date: "2025-12-12", amount: "₹1,500", status: "pending", phone: "+1 234-567-8970", email: "avery.martinez@email.com", location: "Art Gallery", time: "6:00 PM - 9:00 PM", guests: 60, notes: "Classical music for gallery opening. Elegant background music." },
    ],
    "Lighting": [
      { id: 71, customer: "Ava Wilson", service: "Wedding Lighting", date: "2025-10-26", amount: "₹1,200", status: "pending", phone: "+1 234-567-8971", email: "ava.wilson@email.com", location: "Garden Venue", time: "5:00 PM - 11:00 PM", guests: 100, notes: "Romantic lighting setup with string lights and uplighting. Warm ambiance." },
      { id: 72, customer: "Jackson Davis", service: "Corporate Lighting", date: "2025-11-05", amount: "₹800", status: "completed", phone: "+1 234-567-8972", email: "jackson.davis@company.com", location: "Conference Center", time: "7:00 AM - 7:00 PM", guests: 200, notes: "Professional lighting for product launch event. Stage and audience lighting." },
      { id: 73, customer: "Scarlett Johnson", service: "Party Lighting", date: "2025-11-12", amount: "₹600", status: "in_progress", phone: "+1 234-567-8973", email: "scarlett.johnson@email.com", location: "Event Hall", time: "6:00 PM - 12:00 AM", guests: 80, notes: "Colorful party lighting with disco balls and LED effects. Dance floor focus." },
      { id: 74, customer: "Grayson Rodriguez", service: "Architectural Lighting", date: "2025-11-20", amount: "₹1,500", status: "pending", phone: "+1 234-567-8974", email: "grayson.rodriguez@email.com", location: "Historic Building", time: "6:00 PM - 10:00 PM", guests: 300, notes: "Building facade lighting for grand opening. Dramatic color-changing effects." },
      { id: 75, customer: "Layla Chen", service: "Stage Lighting", date: "2025-12-03", amount: "₹1,000", status: "pending", phone: "+1 234-567-8975", email: "layla.chen@email.com", location: "Theater", time: "4:00 PM - 11:00 PM", guests: 150, notes: "Concert lighting design with spotlights and moving heads. Rock band performance." },
    ],
  };
  console.log('Getting bookings for profession:', profession);
  console.log('Available booking categories:', Object.keys(allBookings));
  
  // Handle different profession name formats
  const normalizedProfession = profession.charAt(0).toUpperCase() + profession.slice(1).toLowerCase();
  
  // Try exact match first, then normalized, then fallback
  let bookingsForProfession = allBookings[profession as keyof typeof allBookings] || 
                              allBookings[normalizedProfession as keyof typeof allBookings] || 
                              [];
  
  console.log('Found bookings:', bookingsForProfession.length);
  return bookingsForProfession;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200 shadow-sm';
    case 'pending':
      return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200 shadow-sm';
    case 'in_progress':
      return 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200 shadow-sm';
    case 'completed':
      return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 shadow-sm';
    case 'cancelled':
      return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200 shadow-sm';
    default:
      return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200 shadow-sm';
  }
};

const Bookings = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verificationStatus = getVerificationStatus();
    const vendorProfile = JSON.parse(localStorage.getItem('vendor_profile') || '{}');
    const isVerifiedFromProfile = vendorProfile.is_verified || false;
    
    const verified = verificationStatus === "approved" || isVerifiedFromProfile;
    setIsVerified(verified);
  }, []);

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Bookings</h1>
        </div>
        
        <Card className="text-center py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-none shadow-2xl">
          <CardContent>
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-8 shadow-lg">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">🔒 Verification Required</h2>
            <p className="text-amber-700 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
              You need to complete verification to start receiving bookings. Complete your verification to unlock this feature and start managing your bookings.
            </p>
            <Button 
              onClick={() => navigate('/vendor/dashboard/verification')}
              className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              ✨ Complete Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      <VendorBookings />

    </div>
  );
};

export default Bookings;





