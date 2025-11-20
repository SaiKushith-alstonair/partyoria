import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Calendar } from "../../../components/ui/calendar";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";

const getEventsByCategory = (category: string) => {
  const eventsByCategory = {
    Photography: [
      { date: new Date(2025, 9, 5), title: "Wedding Photography", customer: "Sarah Johnson", amount: "₹2,500", status: "in_progress" },
      { date: new Date(2025, 9, 8), title: "Corporate Photography", customer: "Mike Chen", amount: "₹1,800", status: "confirmed" },
      { date: new Date(2025, 9, 12), title: "Birthday Photography", customer: "Emma Wilson", amount: "₹1,200", status: "pending" },
      { date: new Date(2025, 9, 15), title: "Event Photography", customer: "James Brown", amount: "₹2,000", status: "confirmed" },
      { date: new Date(2025, 9, 18), title: "Portrait Session", customer: "Olivia Davis", amount: "₹800", status: "pending" },
      { date: new Date(2025, 9, 22), title: "Family Photography", customer: "Wilson Family", amount: "₹1,000", status: "confirmed" },
      { date: new Date(2025, 9, 25), title: "Product Photography", customer: "Tech Corp", amount: "₹2,200", status: "pending" },
      { date: new Date(2025, 9, 28), title: "Fashion Photography", customer: "Style Studio", amount: "₹1,800", status: "confirmed" },
      { date: new Date(2025, 10, 5), title: "Engagement Photography", customer: "David Wilson", amount: "₹1,500", status: "confirmed" },
      { date: new Date(2025, 10, 12), title: "Family Photography", customer: "Lisa Martinez", amount: "₹1,000", status: "pending" },
      { date: new Date(2025, 10, 20), title: "Product Photography", customer: "Tech Corp", amount: "₹2,200", status: "confirmed" },
      { date: new Date(2025, 10, 27), title: "Fashion Photography", customer: "Style Studio", amount: "₹1,800", status: "pending" },
      { date: new Date(2025, 11, 3), title: "Real Estate Photography", customer: "Property Plus", amount: "₹1,200", status: "confirmed" },
      { date: new Date(2025, 9, 5), title: "Wedding Photography", customer: "October Bride", amount: "₹2,800", status: "confirmed" },
      { date: new Date(2025, 9, 12), title: "Corporate Event Photography", customer: "Tech Summit", amount: "₹2,200", status: "pending" },
      { date: new Date(2025, 9, 18), title: "Birthday Photography", customer: "Celebration Family", amount: "₹1,400", status: "confirmed" },
      { date: new Date(2025, 9, 25), title: "Festival Photography", customer: "Cultural Events", amount: "₹1,800", status: "pending" },
    ],
    Catering: [
      { date: new Date(2025, 9, 16), title: "Corporate Catering", customer: "Mike Chen", amount: "₹3,200", status: "confirmed" },
      { date: new Date(2025, 9, 20), title: "Wedding Catering", customer: "John Williams", amount: "₹2,800", status: "pending" },
      { date: new Date(2025, 9, 23), title: "Birthday Catering", customer: "Emily Davis", amount: "₹850", status: "confirmed" },
      { date: new Date(2025, 9, 29), title: "Corporate Lunch", customer: "Alex Martinez", amount: "₹1,500", status: "pending" },
      { date: new Date(2025, 10, 8), title: "Anniversary Dinner", customer: "Sophie Taylor", amount: "₹1,200", status: "confirmed" },
      { date: new Date(2025, 10, 15), title: "Holiday Party Catering", customer: "Ryan Clark", amount: "₹3,200", status: "pending" },
      { date: new Date(2025, 10, 22), title: "Buffet Service", customer: "Maria Santos", amount: "₹2,400", status: "confirmed" },
      { date: new Date(2025, 11, 1), title: "New Year Catering", customer: "Party Central", amount: "₹4,500", status: "confirmed" },
      { date: new Date(2025, 11, 14), title: "Valentine's Dinner", customer: "Romance Restaurant", amount: "₹1,800", status: "pending" },
      { date: new Date(2025, 11, 28), title: "Corporate Meeting", customer: "Business Hub", amount: "₹2,000", status: "confirmed" },
      { date: new Date(2025, 9, 8), title: "Wedding Catering", customer: "October Wedding", amount: "₹3,500", status: "confirmed" },
      { date: new Date(2025, 9, 15), title: "Corporate Lunch", customer: "Business Conference", amount: "₹2,800", status: "pending" },
      { date: new Date(2025, 9, 22), title: "Birthday Party Catering", customer: "Party Celebration", amount: "₹1,200", status: "confirmed" },
      { date: new Date(2025, 9, 29), title: "Festival Catering", customer: "Community Event", amount: "₹4,000", status: "pending" },
    ],
    DJ: [
      { date: new Date(2025, 9, 14), title: "Wedding DJ", customer: "Robert Smith", amount: "₹1,500", status: "pending" },
      { date: new Date(2025, 9, 21), title: "Corporate DJ", customer: "Lisa Anderson", amount: "₹1,200", status: "confirmed" },
      { date: new Date(2025, 9, 28), title: "Birthday Party DJ", customer: "Mark Johnson", amount: "₹800", status: "pending" },
      { date: new Date(2025, 9, 31), title: "New Year's Eve DJ", customer: "Club Nights", amount: "₹3,000", status: "confirmed" },
      { date: new Date(2025, 10, 7), title: "School Dance DJ", customer: "Kevin White", amount: "₹600", status: "pending" },
      { date: new Date(2025, 10, 14), title: "Club Event DJ", customer: "Rachel Green", amount: "₹2,000", status: "confirmed" },
      { date: new Date(2025, 10, 25), title: "Corporate Party DJ", customer: "Tech Solutions", amount: "₹1,400", status: "pending" },
      { date: new Date(2025, 11, 8), title: "Private Party DJ", customer: "Elite Events", amount: "₹1,800", status: "confirmed" },
      { date: new Date(2025, 11, 15), title: "Wedding Reception DJ", customer: "Happy Couples", amount: "₹1,600", status: "pending" },
      { date: new Date(2025, 11, 29), title: "Festival DJ", customer: "Music Fest", amount: "₹2,500", status: "confirmed" },
      { date: new Date(2025, 9, 6), title: "Wedding DJ", customer: "October Celebration", amount: "₹1,800", status: "confirmed" },
      { date: new Date(2025, 9, 13), title: "Corporate Party DJ", customer: "Company Event", amount: "₹1,500", status: "pending" },
      { date: new Date(2025, 9, 20), title: "Birthday DJ", customer: "Party Time", amount: "₹1,000", status: "confirmed" },
      { date: new Date(2025, 9, 27), title: "Halloween Party DJ", customer: "Spooky Events", amount: "₹1,200", status: "pending" },
    ],
    Decoration: [
      { date: new Date(2025, 10, 17), title: "Birthday Decoration", customer: "Emily Davis", amount: "₹850", status: "confirmed" },
      { date: new Date(2025, 9, 24), title: "Wedding Decoration", customer: "Anna Wilson", amount: "₹1,800", status: "pending" },
      { date: new Date(2025, 9, 30), title: "Baby Shower Decoration", customer: "Tom Brown", amount: "₹650", status: "confirmed" },
      { date: new Date(2025, 10, 22), title: "Corporate Event Decoration", customer: "Maya Patel", amount: "₹1,200", status: "pending" },
      { date: new Date(2025, 10, 20), title: "Anniversary Decoration", customer: "Nina Rodriguez", amount: "₹900", status: "confirmed" },
      { date: new Date(2025, 10, 19), title: "Graduation Decoration", customer: "School Board", amount: "₹1,100", status: "pending" },
      { date: new Date(2025, 10, 26), title: "Engagement Decoration", customer: "Love Birds", amount: "₹750", status: "confirmed" },
      { date: new Date(2025, 11, 9), title: "Valentine's Decoration", customer: "Romance Inc", amount: "₹600", status: "pending" },
      { date: new Date(2025, 11, 16), title: "Corporate Launch Decoration", customer: "Startup Hub", amount: "₹1,500", status: "confirmed" },
      { date: new Date(2025, 11, 23), title: "Theme Party Decoration", customer: "Party Planners", amount: "₹950", status: "pending" },
      { date: new Date(2025, 9, 27), title: "Wedding Decoration", customer: "Autumn Wedding", amount: "₹2,200", status: "confirmed" },
      { date: new Date(2025, 9, 19), title: "Corporate Event Decoration", customer: "Business Launch", amount: "₹1,800", status: "pending" },
      { date: new Date(2025, 9, 21), title: "Birthday Decoration", customer: "Special Birthday", amount: "₹1,000", status: "confirmed" },
      { date: new Date(2025, 9, 29), title: "Halloween Decoration", customer: "Spooky Party", amount: "₹1,500", status: "pending" },
    ],
    "Event Manager": [
      { date: new Date(2025, 9, 19), title: "Corporate Event Planning", customer: "Lisa Anderson", amount: "₹4,000", status: "confirmed" },
      { date: new Date(2025, 9, 26), title: "Wedding Planning", customer: "David Lee", amount: "₹3,500", status: "pending" },
      { date: new Date(2025, 10, 9), title: "Conference Planning", customer: "Maria Garcia", amount: "₹2,800", status: "confirmed" },
      { date: new Date(2025, 10, 16), title: "Birthday Party Planning", customer: "Steven Adams", amount: "₹1,500", status: "pending" },
      { date: new Date(2025, 10, 23), title: "Charity Event Planning", customer: "Daniel Wilson", amount: "₹2,200", status: "confirmed" },
      { date: new Date(2025, 10, 30), title: "Product Launch Planning", customer: "Innovation Corp", amount: "₹3,200", status: "pending" },
      { date: new Date(2025, 11, 6), title: "Awards Ceremony Planning", customer: "Excellence Awards", amount: "₹2,800", status: "confirmed" },
      { date: new Date(2025, 11, 13), title: "Team Building Event", customer: "Corporate Teams", amount: "₹1,800", status: "pending" },
      { date: new Date(2025, 11, 20), title: "Festival Planning", customer: "Cultural Society", amount: "₹4,500", status: "confirmed" },
      { date: new Date(2025, 11, 27), title: "Retirement Party Planning", customer: "Senior Citizens", amount: "₹1,200", status: "pending" },
      { date: new Date(2025, 9, 9), title: "Wedding Planning", customer: "October Couple", amount: "₹4,500", status: "confirmed" },
      { date: new Date(2025, 9, 16), title: "Corporate Conference Planning", customer: "Tech Conference", amount: "₹3,800", status: "pending" },
      { date: new Date(2025, 9, 23), title: "Birthday Party Planning", customer: "Milestone Birthday", amount: "₹2,200", status: "confirmed" },
      { date: new Date(2025, 9, 30), title: "Halloween Event Planning", customer: "Community Halloween", amount: "₹2,800", status: "pending" },
    ],
    Transportation: [
      { date: new Date(2025, 9, 16), title: "Wedding Transportation", customer: "Michael Brown", amount: "₹800", status: "pending" },
      { date: new Date(2025, 9, 22), title: "Airport Transfer", customer: "Patricia Wilson", amount: "₹150", status: "confirmed" },
      { date: new Date(2025, 9, 27), title: "Corporate Transport", customer: "Carlos Rodriguez", amount: "₹600", status: "pending" },
      { date: new Date(2025, 10, 4), title: "Party Bus Rental", customer: "Amanda Foster", amount: "₹1,200", status: "confirmed" },
      { date: new Date(2025, 10, 11), title: "Event Shuttle", customer: "Robert Chen", amount: "₹900", status: "pending" },
      { date: new Date(2025, 10, 17), title: "VIP Transport", customer: "Elite Services", amount: "₹1,500", status: "confirmed" },
      { date: new Date(2025, 10, 24), title: "Group Transportation", customer: "Travel Group", amount: "₹1,800", status: "pending" },
      { date: new Date(2025, 11, 2), title: "Executive Transport", customer: "Business Elite", amount: "₹2,000", status: "confirmed" },
      { date: new Date(2025, 11, 10), title: "Tourist Transport", customer: "Tourism Board", amount: "₹1,100", status: "pending" },
      { date: new Date(2025, 11, 18), title: "School Transport", customer: "Education Dept", amount: "₹700", status: "confirmed" },
      { date: new Date(2025, 9, 10), title: "Wedding Transportation", customer: "Bridal Party", amount: "₹1,200", status: "confirmed" },
      { date: new Date(2025, 9, 17), title: "Corporate Transport", customer: "Business Meeting", amount: "₹800", status: "pending" },
      { date: new Date(2025, 9, 24), title: "Party Bus Rental", customer: "Birthday Celebration", amount: "₹1,500", status: "confirmed" },
      { date: new Date(2025, 9, 31), title: "Halloween Transport", customer: "Costume Party", amount: "₹900", status: "pending" },
    ],
    Florist: [
      { date: new Date(2025, 9, 18), title: "Wedding Flowers", customer: "Jennifer Davis", amount: "₹1,500", status: "pending" },
      { date: new Date(2025, 9, 25), title: "Corporate Arrangements", customer: "Thomas Anderson", amount: "₹800", status: "confirmed" },
      { date: new Date(2025, 9, 30), title: "Holiday Arrangements", customer: "Festival Committee", amount: "₹1,200", status: "pending" },
      { date: new Date(2025, 10, 8), title: "Birthday Flowers", customer: "Lisa Park", amount: "₹300", status: "confirmed" },
      { date: new Date(2025, 10, 15), title: "Anniversary Bouquet", customer: "David Kim", amount: "₹250", status: "pending" },
      { date: new Date(2025, 10, 22), title: "Valentine's Arrangements", customer: "Love Express", amount: "₹900", status: "confirmed" },
      { date: new Date(2025, 10, 29), title: "Corporate Office Flowers", customer: "Office Complex", amount: "₹600", status: "pending" },
      { date: new Date(2025, 11, 5), title: "Engagement Flowers", customer: "Happy Couple", amount: "₹750", status: "confirmed" },
      { date: new Date(2025, 11, 12), title: "Event Centerpieces", customer: "Event Hall", amount: "₹1,100", status: "pending" },
      { date: new Date(2025, 11, 19), title: "Sympathy Flowers", customer: "Memorial Services", amount: "₹500", status: "confirmed" },
      { date: new Date(2025, 9, 11), title: "Wedding Flowers", customer: "Autumn Bride", amount: "₹1,800", status: "confirmed" },
      { date: new Date(2025, 9, 18), title: "Corporate Arrangements", customer: "Office Opening", amount: "₹1,200", status: "pending" },
      { date: new Date(2025, 9, 25), title: "Birthday Flowers", customer: "Special Day", amount: "₹400", status: "confirmed" },
      { date: new Date(2025, 9, 31), title: "Halloween Arrangements", customer: "Spooky Decor", amount: "₹600", status: "pending" },
    ],
    Baker: [
      { date: new Date(2025, 9, 20), title: "Wedding Cake", customer: "Lisa Martinez", amount: "₹800", status: "pending" },
      { date: new Date(2025, 9, 24), title: "Birthday Cake", customer: "James Wilson", amount: "₹150", status: "confirmed" },
      { date: new Date(2025, 9, 31), title: "New Year Cake", customer: "Party Central", amount: "₹600", status: "pending" },
      { date: new Date(2025, 10, 7), title: "Corporate Desserts", customer: "Sarah Thompson", amount: "₹400", status: "confirmed" },
      { date: new Date(2025, 10, 14), title: "Anniversary Cake", customer: "Michael Garcia", amount: "₹300", status: "pending" },
      { date: new Date(2025, 10, 21), title: "Baby Shower Treats", customer: "Emily Rodriguez", amount: "₹250", status: "confirmed" },
      { date: new Date(2025, 10, 28), title: "Graduation Cake", customer: "School Celebration", amount: "₹350", status: "pending" },
      { date: new Date(2025, 11, 4), title: "Valentine's Desserts", customer: "Sweet Love", amount: "₹450", status: "confirmed" },
      { date: new Date(2025, 11, 11), title: "Corporate Meeting Treats", customer: "Business Hub", amount: "₹300", status: "pending" },
      { date: new Date(2025, 11, 25), title: "Engagement Cake", customer: "Future Bride", amount: "₹500", status: "confirmed" },
      { date: new Date(2025, 9, 12), title: "Wedding Cake", customer: "October Wedding", amount: "₹1,200", status: "confirmed" },
      { date: new Date(2025, 9, 19), title: "Corporate Desserts", customer: "Business Event", amount: "₹800", status: "pending" },
      { date: new Date(2025, 9, 26), title: "Birthday Cake", customer: "Birthday Celebration", amount: "₹300", status: "confirmed" },
      { date: new Date(2025, 9, 31), title: "Halloween Treats", customer: "Spooky Sweets", amount: "₹450", status: "pending" },
    ],
    Videography: [
      { date: new Date(2025, 9, 21), title: "Wedding Videography", customer: "Amanda Taylor", amount: "₹2,200", status: "pending" },
      { date: new Date(2025, 9, 28), title: "Corporate Video", customer: "Robert Johnson", amount: "₹1,800", status: "confirmed" },
      { date: new Date(2025, 10, 6), title: "Event Documentation", customer: "Jessica Brown", amount: "₹1,200", status: "pending" },
      { date: new Date(2025, 10, 13), title: "Birthday Video", customer: "Daniel Lee", amount: "₹600", status: "confirmed" },
      { date: new Date(2025, 10, 19), title: "Music Video", customer: "Michelle Davis", amount: "₹2,500", status: "pending" },
      { date: new Date(2025, 10, 26), title: "Product Video", customer: "Tech Launch", amount: "₹1,500", status: "confirmed" },
      { date: new Date(2025, 11, 3), title: "Training Video", customer: "Education Corp", amount: "₹1,000", status: "pending" },
      { date: new Date(2025, 11, 10), title: "Documentary", customer: "Film Society", amount: "₹3,000", status: "confirmed" },
      { date: new Date(2025, 11, 17), title: "Promotional Video", customer: "Marketing Agency", amount: "₹1,800", status: "pending" },
      { date: new Date(2025, 11, 24), title: "Live Stream", customer: "Online Events", amount: "₹1,200", status: "confirmed" },
      { date: new Date(2025, 9, 13), title: "Wedding Videography", customer: "Autumn Wedding", amount: "₹2,800", status: "confirmed" },
      { date: new Date(2025, 9, 20), title: "Corporate Video", customer: "Company Launch", amount: "₹2,200", status: "pending" },
      { date: new Date(2025, 9, 27), title: "Event Documentation", customer: "Special Event", amount: "₹1,500", status: "confirmed" },
      { date: new Date(2025, 9, 31), title: "Halloween Video", customer: "Costume Contest", amount: "₹800", status: "pending" },
    ],
    "Makeup Artist": [
      { date: new Date(2025, 9, 17), title: "Bridal Makeup", customer: "Rachel Green", amount: "₹400", status: "pending" },
      { date: new Date(2025, 9, 23), title: "Photoshoot Makeup", customer: "Sophia Martinez", amount: "₹300", status: "confirmed" },
      { date: new Date(2025, 9, 29), title: "Party Makeup", customer: "Isabella Wilson", amount: "₹200", status: "pending" },
      { date: new Date(2025, 10, 5), title: "Special Event Makeup", customer: "Olivia Johnson", amount: "₹250", status: "confirmed" },
      { date: new Date(2025, 10, 12), title: "Group Makeup", customer: "Emma Thompson", amount: "₹600", status: "pending" },
      { date: new Date(2025, 10, 18), title: "Fashion Show Makeup", customer: "Style Week", amount: "₹800", status: "confirmed" },
      { date: new Date(2025, 10, 25), title: "Corporate Headshots Makeup", customer: "Business Photos", amount: "₹350", status: "pending" },
      { date: new Date(2025, 11, 1), title: "New Year Makeup", customer: "Party Queen", amount: "₹300", status: "confirmed" },
      { date: new Date(2025, 11, 8), title: "Anniversary Makeup", customer: "Celebration Time", amount: "₹250", status: "pending" },
      { date: new Date(2025, 11, 15), title: "Valentine's Makeup", customer: "Love Day", amount: "₹280", status: "confirmed" },
      { date: new Date(2025, 9, 14), title: "Bridal Makeup", customer: "October Bride", amount: "₹500", status: "confirmed" },
      { date: new Date(2025, 9, 21), title: "Party Makeup", customer: "Birthday Girl", amount: "₹300", status: "pending" },
      { date: new Date(2025, 9, 28), title: "Special Event Makeup", customer: "Corporate Event", amount: "₹350", status: "confirmed" },
      { date: new Date(2025, 9, 31), title: "Halloween Makeup", customer: "Costume Party", amount: "₹400", status: "pending" },
    ],
    "Hair Stylist": [
      { date: new Date(2025, 9, 19), title: "Bridal Hairstyle", customer: "Emma Johnson", amount: "₹300", status: "pending" },
      { date: new Date(2025, 9, 26), title: "Party Hair", customer: "Grace Wilson", amount: "₹180", status: "confirmed" },
      { date: new Date(2025, 10, 2), title: "Photoshoot Styling", customer: "Ava Martinez", amount: "₹250", status: "pending" },
      { date: new Date(2025, 10, 9), title: "Special Event Hair", customer: "Chloe Davis", amount: "₹200", status: "confirmed" },
      { date: new Date(2025, 10, 16), title: "Bridal Party Hair", customer: "Mia Rodriguez", amount: "₹500", status: "pending" },
      { date: new Date(2025, 10, 23), title: "Fashion Hair", customer: "Runway Models", amount: "₹400", status: "confirmed" },
      { date: new Date(2025, 10, 30), title: "Corporate Hair", customer: "Executive Style", amount: "₹220", status: "pending" },
      { date: new Date(2025, 11, 6), title: "Casual Styling", customer: "Everyday Beauty", amount: "₹150", status: "confirmed" },
      { date: new Date(2025, 11, 13), title: "Wedding Guest Hair", customer: "Guest Glam", amount: "₹180", status: "pending" },
      { date: new Date(2025, 11, 20), title: "Anniversary Hair", customer: "Special Moments", amount: "₹200", status: "confirmed" },
      { date: new Date(2025, 9, 15), title: "Bridal Hairstyle", customer: "October Bride", amount: "₹400", status: "confirmed" },
      { date: new Date(2025, 9, 22), title: "Party Hair", customer: "Birthday Celebration", amount: "₹250", status: "pending" },
      { date: new Date(2025, 9, 29), title: "Special Event Hair", customer: "Corporate Gala", amount: "₹300", status: "confirmed" },
      { date: new Date(2025, 9, 31), title: "Halloween Hair", customer: "Costume Styling", amount: "₹350", status: "pending" },
    ],
    "Fashion Designer": [
      { date: new Date(2025, 9, 22), title: "Bridal Wear", customer: "Isabella Wilson", amount: "₹2,500", status: "pending" },
      { date: new Date(2025, 9, 28), title: "Party Dress", customer: "Sophia Chen", amount: "₹800", status: "confirmed" },
      { date: new Date(2025, 10, 4), title: "Evening Gown", customer: "Victoria Brown", amount: "₹1,200", status: "pending" },
      { date: new Date(2025, 10, 11), title: "Bridesmaid Dresses", customer: "Natalie Garcia", amount: "₹1,800", status: "confirmed" },
      { date: new Date(2025, 10, 18), title: "Cocktail Dress", customer: "Aria Johnson", amount: "₹600", status: "pending" },
      { date: new Date(2025, 10, 25), title: "Custom Suit", customer: "Business Elite", amount: "₹1,500", status: "confirmed" },
      { date: new Date(2025, 11, 1), title: "New Year Outfit", customer: "Party Fashion", amount: "₹900", status: "pending" },
      { date: new Date(2025, 11, 8), title: "Formal Wear", customer: "Corporate Style", amount: "₹1,100", status: "confirmed" },
      { date: new Date(2025, 11, 15), title: "Valentine's Dress", customer: "Romance Wear", amount: "₹700", status: "pending" },
      { date: new Date(2025, 11, 22), title: "Anniversary Outfit", customer: "Celebration Attire", amount: "₹850", status: "confirmed" },
      { date: new Date(2025, 9, 16), title: "Bridal Wear", customer: "October Wedding", amount: "₹3,000", status: "confirmed" },
      { date: new Date(2025, 9, 23), title: "Party Dress", customer: "Birthday Outfit", amount: "₹1,200", status: "pending" },
      { date: new Date(2025, 9, 30), title: "Evening Gown", customer: "Corporate Gala", amount: "₹1,800", status: "confirmed" },
      { date: new Date(2025, 9, 31), title: "Halloween Costume", customer: "Spooky Style", amount: "₹800", status: "pending" },
    ],
    "Gift Services": [
      { date: new Date(2025, 9, 20), title: "Wedding Favors", customer: "Grace Taylor", amount: "₹500", status: "pending" },
      { date: new Date(2025, 9, 25), title: "Corporate Gifts", customer: "Oliver Martinez", amount: "₹800", status: "confirmed" },
      { date: new Date(2025, 9, 31), title: "New Year Gifts", customer: "Celebration Gifts", amount: "₹600", status: "pending" },
      { date: new Date(2025, 10, 7), title: "Baby Shower Gifts", customer: "Luna Davis", amount: "₹300", status: "confirmed" },
      { date: new Date(2025, 10, 14), title: "Anniversary Gifts", customer: "Zoe Rodriguez", amount: "₹400", status: "pending" },
      { date: new Date(2025, 10, 21), title: "Birthday Gift Hampers", customer: "Party Gifts", amount: "₹350", status: "confirmed" },
      { date: new Date(2025, 10, 28), title: "Corporate Appreciation", customer: "Business Thanks", amount: "₹900", status: "pending" },
      { date: new Date(2025, 11, 4), title: "Valentine's Gifts", customer: "Love Gifts", amount: "₹450", status: "confirmed" },
      { date: new Date(2025, 11, 11), title: "Graduation Gifts", customer: "Achievement Gifts", amount: "₹300", status: "pending" },
      { date: new Date(2025, 11, 18), title: "Custom Gift Boxes", customer: "Personal Touch", amount: "₹550", status: "confirmed" },
      { date: new Date(2025, 9, 17), title: "Wedding Favors", customer: "October Couple", amount: "₹700", status: "confirmed" },
      { date: new Date(2025, 9, 24), title: "Corporate Gifts", customer: "Business Appreciation", amount: "₹1,000", status: "pending" },
      { date: new Date(2025, 9, 31), title: "Halloween Gift Hampers", customer: "Spooky Gifts", amount: "₹500", status: "confirmed" },
    ],
    Entertainment: [
      { date: new Date(2025, 9, 21), title: "Live Band", customer: "Charlotte Johnson", amount: "₹2,000", status: "pending" },
      { date: new Date(2025, 9, 28), title: "Dance Troupe", customer: "Mason Brown", amount: "₹1,500", status: "confirmed" },
      { date: new Date(2025, 9, 31), title: "New Year Entertainment", customer: "Party Central", amount: "₹3,000", status: "pending" },
      { date: new Date(2025, 10, 8), title: "Magician", customer: "Harper Wilson", amount: "₹400", status: "confirmed" },
      { date: new Date(2025, 10, 15), title: "Stand-up Comedy", customer: "Logan Garcia", amount: "₹600", status: "pending" },
      { date: new Date(2025, 10, 22), title: "String Quartet", customer: "Avery Martinez", amount: "₹1,500", status: "confirmed" },
      { date: new Date(2025, 10, 29), title: "Folk Dancers", customer: "Cultural Event", amount: "₹1,200", status: "pending" },
      { date: new Date(2025, 11, 5), title: "Jazz Band", customer: "Classy Events", amount: "₹1,800", status: "confirmed" },
      { date: new Date(2025, 11, 12), title: "Karaoke Host", customer: "Fun Nights", amount: "₹500", status: "pending" },
      { date: new Date(2025, 11, 19), title: "Acoustic Performance", customer: "Intimate Venues", amount: "₹800", status: "confirmed" },
      { date: new Date(2025, 9, 18), title: "Live Band", customer: "October Wedding", amount: "₹2,500", status: "confirmed" },
      { date: new Date(2025, 9, 25), title: "Dance Troupe", customer: "Corporate Event", amount: "₹1,800", status: "pending" },
      { date: new Date(2025, 9, 31), title: "Halloween Entertainment", customer: "Spooky Show", amount: "₹1,200", status: "confirmed" },
    ],
    Lighting: [
      { date: new Date(2025, 9, 18), title: "Wedding Lighting", customer: "Ava Wilson", amount: "₹1,200", status: "pending" },
      { date: new Date(2025, 9, 24), title: "Corporate Lighting", customer: "Jackson Davis", amount: "₹800", status: "confirmed" },
      { date: new Date(2025, 9, 30), title: "New Year Lighting", customer: "Celebration Lights", amount: "₹1,800", status: "pending" },
      { date: new Date(2025, 10, 6), title: "Party Lighting", customer: "Scarlett Johnson", amount: "₹600", status: "confirmed" },
      { date: new Date(2025, 10, 13), title: "Architectural Lighting", customer: "Grayson Rodriguez", amount: "₹1,500", status: "pending" },
      { date: new Date(2025, 10, 20), title: "Stage Lighting", customer: "Layla Chen", amount: "₹1,000", status: "confirmed" },
      { date: new Date(2025, 10, 27), title: "Ambient Lighting", customer: "Mood Makers", amount: "₹600", status: "pending" },
      { date: new Date(2025, 11, 3), title: "DJ Lighting", customer: "Dance Floor", amount: "₹800", status: "confirmed" },
      { date: new Date(2025, 11, 10), title: "Event Lighting", customer: "Grand Events", amount: "₹1,100", status: "pending" },
      { date: new Date(2025, 11, 17), title: "Festival Lighting", customer: "Cultural Fest", amount: "₹2,000", status: "confirmed" },
      { date: new Date(2025, 9, 19), title: "Wedding Lighting", customer: "Autumn Wedding", amount: "₹1,500", status: "confirmed" },
      { date: new Date(2025, 9, 26), title: "Corporate Lighting", customer: "Business Launch", amount: "₹1,200", status: "pending" },
      { date: new Date(2025, 9, 31), title: "Halloween Lighting", customer: "Spooky Atmosphere", amount: "₹1,000", status: "confirmed" },
    ]
  };
  
  return eventsByCategory[category as keyof typeof eventsByCategory] || [];
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700';
    case 'completed':
      return 'bg-purple-100 text-purple-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const EventsCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month
  
  // Get vendor category from localStorage
  const vendorData = JSON.parse(localStorage.getItem("vendorOnboarding") || "{}");
  const vendorCategory = vendorData.business || "Photography";
  
  // Use the main getEventsByCategory function defined at the top
  
  const events = getEventsByCategory(vendorCategory);

  const eventsOnDate = events.filter(
    (event) => event.date.toDateString() === selectedDate?.toDateString()
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const eventOnDate = events.find((e) => e.date.toDateString() === date.toDateString());
      if (eventOnDate) {
        setSelectedEvent(eventOnDate);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Calendar View</CardTitle>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-lg font-semibold min-w-[140px] text-center">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 p-4">
              {/* Calendar Header */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-sm text-gray-600 p-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {Array.from({ length: 35 }, (_, i) => {
                const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                const startDate = new Date(firstDay);
                startDate.setDate(startDate.getDate() - firstDay.getDay());
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);
                
                const dayEvents = events.filter(
                  (event) => event.date.toDateString() === currentDate.toDateString()
                );
                const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
                const isSelected = selectedDate?.toDateString() === currentDate.toDateString();
                const today = new Date();
                const isToday = currentDate.getDate() === today.getDate() && 
                               currentDate.getMonth() === today.getMonth() && 
                               currentDate.getFullYear() === today.getFullYear();
                
                // Get background color for day (separate color for each day with events)
                const getEventDayColor = () => {
                  if (dayEvents.length === 0) return 'bg-white';
                  const dayColors = [
                    'bg-red-100 border-red-200',
                    'bg-blue-100 border-blue-200',
                    'bg-green-100 border-green-200',
                    'bg-yellow-100 border-yellow-200',
                    'bg-purple-100 border-purple-200',
                    'bg-pink-100 border-pink-200',
                    'bg-indigo-100 border-indigo-200',
                    'bg-orange-100 border-orange-200',
                    'bg-teal-100 border-teal-200',
                    'bg-cyan-100 border-cyan-200'
                  ];
                  const dayHash = currentDate.getDate() + currentDate.getMonth() * 31;
                  return dayColors[dayHash % dayColors.length];
                };
                
                return (
                  <div
                    key={i}
                    onClick={() => handleDateSelect(currentDate)}
                    className={`min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all ${
                      isToday ? '!bg-blue-500 !text-white !border-blue-600 shadow-lg font-bold ring-2 ring-blue-300' : 
                      isSelected ? 'border-blue-500 bg-blue-100' : getEventDayColor()
                    } ${
                      !isCurrentMonth ? 'opacity-50' : ''
                    } ${
                      dayEvents.length === 0 ? 'hover:border-gray-300' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="text-sm font-bold mb-1 relative">
                      {currentDate.getDate()}
                      {isToday && <span className="absolute -top-1 -right-1 text-xs font-bold">Today</span>}
                    </div>
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-1 mb-1 truncate font-bold text-gray-700"
                        title={`${event.title} - ${event.customer}`}
                      >
                        {event.title.length > 10 ? event.title.substring(0, 10) + '...' : event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 font-bold">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events
                .filter((event) => event.date >= new Date())
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map((event, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{event.title}</p>
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        {event.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">{event.customer}</p>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-primary mt-1">{event.amount}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="text-lg font-semibold">{selectedEvent.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="text-lg font-semibold">{selectedEvent.customer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="text-lg font-semibold">
                  {selectedEvent.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={getStatusColor(selectedEvent.status)}>
                  {selectedEvent.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold text-primary">{selectedEvent.amount}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsCalendar;





