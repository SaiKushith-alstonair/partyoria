import { EventSection, Vendor, FestivalSubtype } from '../types';

const createVendor = (name: string, category: string): Vendor => ({
  id: `vendor-${name.toLowerCase().replace(/\s+/g, '-')}`,
  name,
  category,
  selected: false,
});

// Common vendor categories
const commonVendors = {
  catering: [
    createVendor('Premium Caterers', 'Catering'),
    createVendor('Local Food Vendors', 'Catering'),
    createVendor('Specialty Cuisine Chefs', 'Catering'),
  ],
  photography: [
    createVendor('Professional Photographers', 'Photography'),
    createVendor('Videographers', 'Photography'),
    createVendor('Drone Photography', 'Photography'),
  ],
  entertainment: [
    createVendor('DJs & Music', 'Entertainment'),
    createVendor('Live Bands', 'Entertainment'),
    createVendor('Performers', 'Entertainment'),
  ],
  decoration: [
    createVendor('Event Decorators', 'Decoration'),
    createVendor('Lighting Specialists', 'Decoration'),
    createVendor('Floral Arrangements', 'Decoration'),
  ],
  technical: [
    createVendor('AV Technicians', 'Technical'),
    createVendor('Sound Systems', 'Technical'),
    createVendor('Stage Setup', 'Technical'),
  ],
  security: [
    createVendor('Security Services', 'Security'),
    createVendor('Crowd Control', 'Security'),
  ],
  coordination: [
    createVendor('Event Coordinators', 'Coordination'),
    createVendor('Venue Managers', 'Coordination'),
  ],
};

export const festivalSubtypes: FestivalSubtype[] = [
  { id: 'diwali-celebration', name: 'Diwali Celebration', additionalVendors: [createVendor('Diya & Candle Suppliers', 'Decoration'), createVendor('Rangoli Artists', 'Decoration'), createVendor('Fireworks Coordinators', 'Entertainment'), createVendor('Sweet Vendors', 'Catering')] },
  { id: 'holi-festival', name: 'Holi Festival', additionalVendors: [createVendor('Organic Color Suppliers', 'Entertainment'), createVendor('Dhol Players', 'Entertainment'), createVendor('Water Gun Suppliers', 'Entertainment'), createVendor('Thandai Vendors', 'Catering')] },
  { id: 'eid-al-fitr', name: 'Eid al-Fitr', additionalVendors: [createVendor('Halal Caterers', 'Catering'), createVendor('Henna Artists', 'Beauty'), createVendor('Islamic Calligraphy Artists', 'Decoration'), createVendor('Traditional Performers', 'Entertainment')] },
  { id: 'eid-al-adha', name: 'Eid al-Adha', additionalVendors: [createVendor('Halal Meat Suppliers', 'Catering'), createVendor('Islamic Decorators', 'Decoration'), createVendor('Community Organizers', 'Coordination'), createVendor('Religious Speakers', 'Speaking')] },
  { id: 'christmas-celebration', name: 'Christmas Celebration', additionalVendors: [createVendor('Christmas Tree Suppliers', 'Decoration'), createVendor('Santa Claus Services', 'Entertainment'), createVendor('Carol Singers', 'Entertainment'), createVendor('Gift Wrapping Services', 'Services')] },
  { id: 'new-years-party', name: 'New Years Party', additionalVendors: [createVendor('Countdown Coordinators', 'Entertainment'), createVendor('Fireworks Display', 'Entertainment'), createVendor('Champagne Suppliers', 'Catering'), createVendor('Party Hat Suppliers', 'Decoration')] },
  { id: 'navratri-garba', name: 'Navratri Garba', additionalVendors: [createVendor('Garba Instructors', 'Entertainment'), createVendor('Dandiya Stick Suppliers', 'Entertainment'), createVendor('Traditional Costume Rental', 'Services'), createVendor('Gujarati Food Vendors', 'Catering')] },
  { id: 'ganesh-chaturthi', name: 'Ganesh Chaturthi', additionalVendors: [createVendor('Ganesh Idol Makers', 'Decoration'), createVendor('Pandal Decorators', 'Decoration'), createVendor('Dhol Tasha Pathak', 'Entertainment'), createVendor('Modak Specialists', 'Catering')] },
  { id: 'raksha-bandhan', name: 'Raksha Bandhan', additionalVendors: [createVendor('Rakhi Vendors', 'Services'), createVendor('Gift Suppliers', 'Services'), createVendor('Sweet Box Vendors', 'Catering'), createVendor('Henna Artists', 'Beauty')] },
  { id: 'janmashtami', name: 'Janmashtami', additionalVendors: [createVendor('Krishna Costume Suppliers', 'Services'), createVendor('Dahi Handi Organizers', 'Entertainment'), createVendor('Flute Players', 'Entertainment'), createVendor('Makhan Mishri Vendors', 'Catering')] },
  { id: 'onam', name: 'Onam', additionalVendors: [createVendor('Pookalam Flower Vendors', 'Decoration'), createVendor('Kathakali Performers', 'Entertainment'), createVendor('Boat Race Organizers', 'Entertainment'), createVendor('Sadhya Caterers', 'Catering')] },

  { id: 'durga-puja', name: 'Durga Puja', additionalVendors: [createVendor('Pandal Designers', 'Decoration'), createVendor('Durga Idol Artists', 'Decoration'), createVendor('Dhak Players', 'Entertainment'), createVendor('Bengali Food Vendors', 'Catering')] },
  { id: 'baisakhi', name: 'Baisakhi', additionalVendors: [createVendor('Bhangra Performers', 'Entertainment'), createVendor('Turban Tying Services', 'Services'), createVendor('Punjabi Food Vendors', 'Catering'), createVendor('Gurdwara Decorators', 'Decoration')] },
  { id: 'gurupurab', name: 'Gurupurab', additionalVendors: [createVendor('Kirtan Singers', 'Entertainment'), createVendor('Langar Organizers', 'Catering'), createVendor('Nagar Kirtan Coordinators', 'Coordination'), createVendor('Gurdwara Decorators', 'Decoration')] },
  { id: 'makar-sankranti', name: 'Makar Sankranti', additionalVendors: [createVendor('Kite Suppliers', 'Entertainment'), createVendor('Til-Gud Vendors', 'Catering'), createVendor('Kite Flying Instructors', 'Entertainment'), createVendor('Traditional Decorators', 'Decoration')] },
  { id: 'easter-celebration', name: 'Easter Celebration', additionalVendors: [createVendor('Easter Egg Suppliers', 'Entertainment'), createVendor('Bunny Costume Services', 'Entertainment'), createVendor('Church Decorators', 'Decoration'), createVendor('Easter Cake Bakers', 'Catering')] }
];

export const eventSections: EventSection[] = [
  {
    id: 'corporate',
    name: 'Corporate and Professional Events',
    icon: 'Briefcase',
    subsections: [
      {
        id: 'conference',
        name: 'Conference',
        vendors: [
          createVendor('Hotel Venue', 'venue'),
          createVendor('Banquet Hall', 'venue'),
          createVendor('Community Hall', 'venue'),
          ...commonVendors.technical,
          createVendor('Keynote Speakers', 'Speaking'),
          ...commonVendors.catering,
          ...commonVendors.coordination,
          createVendor('Registration Coordinators', 'Coordination'),
          createVendor('Networking Facilitators', 'Coordination'),
          ...commonVendors.security,
          createVendor('Interpreters', 'Services'),
        ],
      },
      {
        id: 'seminar',
        name: 'Seminar',
        vendors: [
          createVendor('Workshop Facilitators', 'Speaking'),
          createVendor('Educational Content Creators', 'Services'),
          ...commonVendors.technical,
          createVendor('Coffee/Refreshment Vendors', 'Catering'),
          ...commonVendors.coordination,
          createVendor('Graphic Designers', 'Services'),
        ],
      },
      {
        id: 'corporate-party',
        name: 'Corporate Party',
        vendors: [
          createVendor('Hotel Venue', 'venue'),
          createVendor('Rooftop Venue', 'venue'),
          createVendor('Banquet Hall', 'venue'),
          createVendor('Farmhouse', 'venue'),
          ...commonVendors.catering,
          ...commonVendors.entertainment,
          ...commonVendors.decoration,
          ...commonVendors.photography,
          createVendor('Bartenders', 'Catering'),
          createVendor('Team-building Activity Providers', 'Entertainment'),
        ],
      },
      {
        id: 'award-ceremony',
        name: 'Award Ceremony',
        vendors: [
          createVendor('Stage Designers', 'Technical'),
          createVendor('Award Engravers', 'Services'),
          ...commonVendors.entertainment,
          ...commonVendors.photography,
          ...commonVendors.catering,
          createVendor('Red-carpet Setup Vendors', 'Decoration'),
          ...commonVendors.security,
        ],
      },
      {
        id: 'product-launch',
        name: 'Product Launch',
        vendors: [
          createVendor('Marketing Agencies', 'Services'),
          createVendor('Demo Equipment Suppliers', 'Technical'),
          createVendor('Influencers/Speakers', 'Speaking'),
          ...commonVendors.photography,
          ...commonVendors.catering,
          createVendor('AV Production Teams', 'Technical'),
          createVendor('Swag Bag Creators', 'Services'),
        ],
      },
      {
        id: 'trade-show',
        name: 'Trade Show',
        vendors: [
          createVendor('Booth Designers', 'Technical'),
          createVendor('Exhibit Hall Managers', 'Coordination'),
          createVendor('Lead Capture Coordinators', 'Services'),
          createVendor('Promotional Product Suppliers', 'Services'),
          ...commonVendors.technical,
          ...commonVendors.security,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'networking-mixer',
        name: 'Networking Mixer',
        vendors: [
          createVendor('Bartenders', 'Catering'),
          createVendor('Appetizers Caterers', 'Catering'),
          createVendor('Icebreaker Activity Facilitators', 'Entertainment'),
          ...commonVendors.photography,
          ...commonVendors.coordination,
          createVendor('Name Badge Printers', 'Services'),
        ],
      },
      {
        id: 'webinar',
        name: 'Webinar',
        vendors: [
          createVendor('Virtual Platform Coordinators', 'Technical'),
          createVendor('Digital Marketers', 'Services'),
          createVendor('Graphic Designers for Slides', 'Services'),
          createVendor('Moderators', 'Speaking'),
          createVendor('Tech Support for Streaming', 'Technical'),
        ],
      },
      {
        id: 'leadership-summit',
        name: 'Leadership Summit',
        vendors: [
          createVendor('Keynote Speakers', 'Speaking'),
          createVendor('Executive Coaches', 'Speaking'),
          ...commonVendors.catering,
          ...commonVendors.coordination,
          createVendor('Note-taking/Recording Services', 'Services'),
          ...commonVendors.security,
        ],
      },

      {
        id: 'hackathon',
        name: 'Hackathon',
        vendors: [
          createVendor('Tech Equipment Suppliers', 'Technical'),
          createVendor('Judges/Mentors', 'Speaking'),
          createVendor('Food Sponsors/Caterers', 'Catering'),
          ...commonVendors.coordination,
          createVendor('Prize Coordinators', 'Services'),
        ],
      },
      {
        id: 'investor-meetup',
        name: 'Investor Meetup',
        vendors: [
          createVendor('Pitch Deck Designers', 'Services'),
          createVendor('Networking Facilitators', 'Coordination'),
          ...commonVendors.catering,
          ...commonVendors.photography,
          ...commonVendors.coordination,
        ],
      },
      {
        id: 'career-expo',
        name: 'Career Expo',
        vendors: [
          createVendor('Recruiters/HR Services', 'Services'),
          createVendor('Booth Setup Vendors', 'Technical'),
          createVendor('Resume Printing Services', 'Services'),
          ...commonVendors.catering,
          createVendor('AV for Presentations', 'Technical'),
        ],
      },

      {
        id: 'industry-roundtable',
        name: 'Industry Roundtable',
        vendors: [
          createVendor('Discussion Moderators', 'Speaking'),
          ...commonVendors.catering,
          createVendor('Recording Services', 'Technical'),
          ...commonVendors.coordination,
        ],
      },
      {
        id: 'press-conference',
        name: 'Press Conference',
        vendors: [
          createVendor('PR Agencies', 'Services'),
          createVendor('AV Production Teams', 'Technical'),
          ...commonVendors.photography,
          ...commonVendors.coordination,
        ],
      },
    ],
  },
  {
    id: 'social',
    name: 'Social and Family Events',
    icon: 'Heart',
    subsections: [
      {
        id: 'wedding',
        name: 'Wedding',
        vendors: [
          createVendor('Palace/Heritage Venue', 'venue'),
          createVendor('Banquet Hall', 'venue'),
          createVendor('Resort Venue', 'venue'),
          createVendor('Garden Venue', 'venue'),
          createVendor('Beach Venue', 'venue'),
          ...commonVendors.photography,
          ...commonVendors.catering,
          ...commonVendors.decoration,
          createVendor('Makeup Artists', 'Beauty'),
          ...commonVendors.entertainment,
          createVendor('Officiants', 'Religious'),
          createVendor('Transportation Services', 'Services'),
          createVendor('Cake Bakers', 'Catering'),
        ],
      },
      {
        id: 'engagement',
        name: 'Engagement',
        vendors: [
          ...commonVendors.photography,
          createVendor('Jewelers', 'Services'),
          ...commonVendors.coordination,
          ...commonVendors.catering,
          ...commonVendors.decoration,
          ...commonVendors.entertainment,
        ],
      },
      {
        id: 'birthday',
        name: 'Birthday',
        vendors: [
          createVendor('Banquet Hall', 'venue'),
          createVendor('Community Hall', 'venue'),
          createVendor('Garden Venue', 'venue'),
          createVendor('Rooftop Venue', 'venue'),
          createVendor('Cake Bakers', 'Catering'),
          ...commonVendors.photography,
          createVendor('Entertainers (Magicians, Balloon Artists)', 'Entertainment'),
          ...commonVendors.catering,
          ...commonVendors.decoration,
          ...commonVendors.entertainment,
        ],
      },
      {
        id: 'anniversary',
        name: 'Anniversary',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.photography,
          ...commonVendors.decoration,
          createVendor('Entertainment Musicians', 'Entertainment'),
          ...commonVendors.coordination,
        ],
      },
      {
        id: 'baby-shower',
        name: 'Baby Shower',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.decoration,
          ...commonVendors.photography,
          createVendor('Cake Bakers', 'Catering'),
          createVendor('Gift Coordinators', 'Services'),
        ],
      },
      {
        id: 'housewarming',
        name: 'Housewarming',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.decoration,
          ...commonVendors.photography,
          createVendor('Real Estate Stylists', 'Services'),
        ],
      },
      {
        id: 'bachelor-party',
        name: 'Bachelor Party',
        vendors: [
          createVendor('Entertainment Providers (DJs, Games)', 'Entertainment'),
          ...commonVendors.catering,
          createVendor('Transportation', 'Services'),
          ...commonVendors.photography,
        ],
      },
      {
        id: 'retirement',
        name: 'Retirement',
        vendors: [
          ...commonVendors.catering,
          createVendor('Speakers/Emcees', 'Speaking'),
          ...commonVendors.photography,
          createVendor('Gift Vendors', 'Services'),
        ],
      },
      {
        id: 'farewell',
        name: 'Farewell',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.entertainment,
          ...commonVendors.photography,
          ...commonVendors.coordination,
        ],
      },
      {
        id: 'graduation-party',
        name: 'Graduation Party',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.photography,
          ...commonVendors.decoration,
          ...commonVendors.entertainment,
        ],
      },

      {
        id: 'kitty-party',
        name: 'Kitty Party',
        vendors: [
          ...commonVendors.catering,
          createVendor('Games Organizers', 'Entertainment'),
          ...commonVendors.decoration,
        ],
      },
      {
        id: 'pre-wedding-shoot',
        name: 'Pre-Wedding Shoot',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.photography,
          ...commonVendors.entertainment,
          ...commonVendors.decoration,
        ],
      },
      {
        id: 'bridal-shower',
        name: 'Bridal Shower',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.decoration,
          ...commonVendors.photography,
          createVendor('Gift Vendors', 'Services'),
        ],
      },
      {
        id: 'gender-reveal-party',
        name: 'Gender Reveal Party',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.decoration,
          ...commonVendors.photography,
          createVendor('Entertainers (Smoke Machines)', 'Entertainment'),
        ],
      },


      {
        id: 'friendship-day-event',
        name: 'Friendship Day Event',
        vendors: [
          ...commonVendors.catering,
          createVendor('Games Organizers', 'Entertainment'),
          ...commonVendors.photography,
        ],
      },
      {
        id: 'valentines-day-celebration',
        name: "Valentine's Day Celebration",
        vendors: [
          ...commonVendors.decoration,
          ...commonVendors.catering,
          createVendor('Musicians', 'Entertainment'),
          ...commonVendors.photography,
        ],
      },
      {
        id: 'adoption-celebration',
        name: 'Adoption Celebration',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.decoration,
          ...commonVendors.photography,
        ],
      },
    ],
  },
  {
    id: 'cultural',
    name: 'Cultural and Traditional Events',
    icon: 'Palette',
    subsections: [
      {
        id: 'cultural-fair',
        name: 'Cultural Fair',
        vendors: [
          createVendor('Outdoor Venue', 'venue'),
          createVendor('Garden Venue', 'venue'),
          createVendor('Community Hall', 'venue'),
          createVendor('Artisans/Crafters', 'Services'),
          createVendor('Food Vendors', 'Catering'),
          createVendor('Performers (Dancers)', 'Entertainment'),
          ...commonVendors.photography,
          createVendor('Stage Managers', 'Technical'),
        ],
      },

      {
        id: 'naming-ceremony',
        name: 'Naming Ceremony',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.photography,
          createVendor('Officiants', 'Religious'),
          ...commonVendors.decoration,
        ],
      },

      {
        id: 'music-concert',
        name: 'Music Concert',
        vendors: [
          createVendor('Sound Engineers', 'Technical'),
          createVendor('Performers', 'Entertainment'),
          createVendor('Ticket Vendors', 'Services'),
          ...commonVendors.photography,
        ],
      },

      {
        id: 'book-launch',
        name: 'Book Launch',
        vendors: [
          createVendor('Authors/Speakers', 'Speaking'),
          ...commonVendors.catering,
          ...commonVendors.photography,
          createVendor('Booksellers', 'Services'),
        ],
      },
      {
        id: 'heritage-walk',
        name: 'Heritage Walk',
        vendors: [
          createVendor('Guides/Tour Leaders', 'Services'),
          ...commonVendors.photography,
          createVendor('Transportation', 'Services'),
        ],
      },

      {
        id: 'food-festival',
        name: 'Food Festival',
        vendors: [
          createVendor('Food Vendors', 'Catering'),
          createVendor('Chefs', 'Catering'),
          ...commonVendors.catering,
          ...commonVendors.entertainment,
        ],
      },


      {
        id: 'cultural-exchange',
        name: 'Cultural Exchange',
        vendors: [
          createVendor('Cultural Representatives', 'Speaking'),
          ...commonVendors.coordination,
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },

      {
        id: 'language-festival',
        name: 'Language Festival',
        vendors: [
          createVendor('Language Instructors', 'Speaking'),
          createVendor('Cultural Performers', 'Entertainment'),
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'handicraft-exhibition',
        name: 'Handicraft Exhibition',
        vendors: [
          createVendor('Artisans', 'Services'),
          createVendor('Display Setup', 'Technical'),
          ...commonVendors.photography,
        ],
      },
      {
        id: 'cultural-parade',
        name: 'Cultural Parade',
        vendors: [
          createVendor('Parade Coordinators', 'Coordination'),
          ...commonVendors.security,
          ...commonVendors.photography,
          createVendor('Traditional Performers', 'Entertainment'),
        ],
      },
      {
        id: 'ethnic-wear-show',
        name: 'Ethnic Wear Show',
        vendors: [
          createVendor('Fashion Designers', 'Services'),
          createVendor('Models', 'Entertainment'),
          ...commonVendors.technical,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'regional-cuisine-fest',
        name: 'Regional Cuisine Fest',
        vendors: [
          createVendor('Regional Chefs', 'Catering'),
          createVendor('Food Vendors', 'Catering'),
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },


      {
        id: 'cultural-documentary-screening',
        name: 'Cultural Documentary Screening',
        vendors: [
          createVendor('AV Equipment', 'Technical'),
          createVendor('Documentary Providers', 'Services'),
          ...commonVendors.catering,
        ],
      },


    ],
  },
  {
    id: 'religious',
    name: 'Religious and Spiritual Events',
    icon: 'Church',
    subsections: [
      {
        id: 'mass-gathering',
        name: 'Mass Gathering',
        vendors: [
          ...commonVendors.security,
          ...commonVendors.technical,
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },


      {
        id: 'interfaith-gathering',
        name: 'Interfaith Gathering',
        vendors: [
          createVendor('Speakers', 'Speaking'),
          ...commonVendors.catering,
          ...commonVendors.coordination,
        ],
      },
      {
        id: 'religious-seminar',
        name: 'Religious Seminar',
        vendors: [
          createVendor('Speakers', 'Speaking'),
          ...commonVendors.technical,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'puja-ceremony',
        name: 'Puja Ceremony',
        vendors: [
          createVendor('Priests/Officiants', 'Religious'),
          createVendor('Ritual Suppliers', 'Services'),
          ...commonVendors.decoration,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'kirtan',
        name: 'Kirtan',
        vendors: [
          createVendor('Musicians', 'Entertainment'),
          createVendor('Singers', 'Entertainment'),
          ...commonVendors.technical,
          ...commonVendors.coordination,
        ],
      },
      {
        id: 'satsang',
        name: 'Satsang',
        vendors: [
          createVendor('Spiritual Speakers', 'Speaking'),
          ...commonVendors.coordination,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'religious-discourse',
        name: 'Religious Discourse',
        vendors: [
          createVendor('Religious Speakers', 'Speaking'),
          ...commonVendors.technical,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'temple-inauguration',
        name: 'Temple Inauguration',
        vendors: [
          createVendor('Religious Authorities', 'Religious'),
          ...commonVendors.decoration,
          ...commonVendors.photography,
          ...commonVendors.catering,
          ...commonVendors.security,
        ],
      },



      {
        id: 'religious-procession',
        name: 'Religious Procession',
        vendors: [
          createVendor('Procession Coordinators', 'Coordination'),
          ...commonVendors.security,
          ...commonVendors.photography,
          createVendor('Traditional Musicians', 'Entertainment'),
        ],
      },
      {
        id: 'prayer-meeting',
        name: 'Prayer Meeting',
        vendors: [
          createVendor('Religious Leaders', 'Religious'),
          ...commonVendors.coordination,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'community-service',
        name: 'Community Service',
        vendors: [
          createVendor('Volunteer Coordinators', 'Coordination'),
          createVendor('Service Suppliers', 'Services'),
          ...commonVendors.photography,
        ],
      },

      {
        id: 'pilgrimage-tour',
        name: 'Pilgrimage Tour',
        vendors: [
          createVendor('Tour Guides', 'Services'),
          createVendor('Transportation Services', 'Services'),
          createVendor('Accommodation Services', 'Services'),
          ...commonVendors.coordination,
        ],
      },
      {
        id: 'blessing-ceremony',
        name: 'Blessing Ceremony',
        vendors: [
          createVendor('Religious Officiants', 'Religious'),
          ...commonVendors.decoration,
          ...commonVendors.photography,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'sacred-thread-ceremony',
        name: 'Sacred Thread Ceremony',
        vendors: [
          createVendor('Priests', 'Religious'),
          createVendor('Ritual Suppliers', 'Services'),
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },

    ],
  },
  {
    id: 'festival',
    name: 'Festival Celebrations',
    icon: 'Sparkles',
    subsections: [
      {
        id: 'diwali-celebration',
        name: 'Diwali Celebration',
        vendors: [
          createVendor('Community Hall', 'venue'),
          createVendor('Banquet Hall', 'venue'),
          createVendor('Garden Venue', 'venue'),
          createVendor('Outdoor Venue', 'venue'),
          createVendor('Diya & Candle Suppliers', 'Decoration'),
          createVendor('Rangoli Artists', 'Decoration'),
          createVendor('Fireworks Coordinators', 'Entertainment'),
          createVendor('Sweet Vendors', 'Catering'),
          ...commonVendors.decoration,
          ...commonVendors.photography,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'holi-festival',
        name: 'Holi Festival',
        vendors: [
          createVendor('Organic Color Suppliers', 'Entertainment'),
          createVendor('Dhol Players', 'Entertainment'),
          createVendor('Water Gun Suppliers', 'Entertainment'),
          createVendor('Thandai Vendors', 'Catering'),
          ...commonVendors.entertainment,
          ...commonVendors.photography,
          ...commonVendors.security,
        ],
      },
      {
        id: 'eid-al-fitr',
        name: 'Eid al-Fitr',
        vendors: [
          createVendor('Halal Caterers', 'Catering'),
          createVendor('Henna Artists', 'Beauty'),
          createVendor('Islamic Calligraphy Artists', 'Decoration'),
          createVendor('Traditional Performers', 'Entertainment'),
          ...commonVendors.decoration,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'eid-al-adha',
        name: 'Eid al-Adha',
        vendors: [
          createVendor('Halal Meat Suppliers', 'Catering'),
          createVendor('Islamic Decorators', 'Decoration'),
          createVendor('Community Organizers', 'Coordination'),
          createVendor('Religious Speakers', 'Speaking'),
          ...commonVendors.catering,
          ...commonVendors.coordination,
        ],
      },
      {
        id: 'christmas-celebration',
        name: 'Christmas Celebration',
        vendors: [
          createVendor('Christmas Tree Suppliers', 'Decoration'),
          createVendor('Santa Claus Services', 'Entertainment'),
          createVendor('Carol Singers', 'Entertainment'),
          createVendor('Gift Wrapping Services', 'Services'),
          ...commonVendors.decoration,
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'new-years-party',
        name: 'New Years Party',
        vendors: [
          createVendor('Rooftop Venue', 'venue'),
          createVendor('Hotel Venue', 'venue'),
          createVendor('Beach Venue', 'venue'),
          createVendor('Banquet Hall', 'venue'),
          createVendor('Countdown Coordinators', 'Entertainment'),
          createVendor('Fireworks Display', 'Entertainment'),
          createVendor('Champagne Suppliers', 'Catering'),
          createVendor('Party Hat Suppliers', 'Decoration'),
          ...commonVendors.entertainment,
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'navratri-garba',
        name: 'Navratri Garba',
        vendors: [
          createVendor('Garba Instructors', 'Entertainment'),
          createVendor('Dandiya Stick Suppliers', 'Entertainment'),
          createVendor('Traditional Costume Rental', 'Services'),
          createVendor('Gujarati Food Vendors', 'Catering'),
          ...commonVendors.entertainment,
          ...commonVendors.technical,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'ganesh-chaturthi',
        name: 'Ganesh Chaturthi',
        vendors: [
          createVendor('Ganesh Idol Makers', 'Decoration'),
          createVendor('Pandal Decorators', 'Decoration'),
          createVendor('Dhol Tasha Pathak', 'Entertainment'),
          createVendor('Modak Specialists', 'Catering'),
          ...commonVendors.decoration,
          ...commonVendors.photography,
          ...commonVendors.security,
        ],
      },
      {
        id: 'raksha-bandhan',
        name: 'Raksha Bandhan',
        vendors: [
          createVendor('Rakhi Vendors', 'Services'),
          createVendor('Gift Suppliers', 'Services'),
          createVendor('Sweet Box Vendors', 'Catering'),
          createVendor('Henna Artists', 'Beauty'),
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'janmashtami',
        name: 'Janmashtami',
        vendors: [
          createVendor('Krishna Costume Suppliers', 'Services'),
          createVendor('Dahi Handi Organizers', 'Entertainment'),
          createVendor('Flute Players', 'Entertainment'),
          createVendor('Makhan Mishri Vendors', 'Catering'),
          ...commonVendors.entertainment,
          ...commonVendors.decoration,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'onam',
        name: 'Onam',
        vendors: [
          createVendor('Pookalam Flower Vendors', 'Decoration'),
          createVendor('Kathakali Performers', 'Entertainment'),
          createVendor('Boat Race Organizers', 'Entertainment'),
          createVendor('Sadhya Caterers', 'Catering'),
          ...commonVendors.decoration,
          ...commonVendors.entertainment,
          ...commonVendors.photography,
        ],
      },

      {
        id: 'durga-puja',
        name: 'Durga Puja',
        vendors: [
          createVendor('Pandal Designers', 'Decoration'),
          createVendor('Durga Idol Artists', 'Decoration'),
          createVendor('Dhak Players', 'Entertainment'),
          createVendor('Bengali Food Vendors', 'Catering'),
          ...commonVendors.decoration,
          ...commonVendors.entertainment,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'baisakhi',
        name: 'Baisakhi',
        vendors: [
          createVendor('Bhangra Performers', 'Entertainment'),
          createVendor('Turban Tying Services', 'Services'),
          createVendor('Punjabi Food Vendors', 'Catering'),
          createVendor('Gurdwara Decorators', 'Decoration'),
          ...commonVendors.entertainment,
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'gurupurab',
        name: 'Gurupurab',
        vendors: [
          createVendor('Kirtan Singers', 'Entertainment'),
          createVendor('Langar Organizers', 'Catering'),
          createVendor('Nagar Kirtan Coordinators', 'Coordination'),
          createVendor('Gurdwara Decorators', 'Decoration'),
          ...commonVendors.coordination,
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'makar-sankranti',
        name: 'Makar Sankranti',
        vendors: [
          createVendor('Kite Suppliers', 'Entertainment'),
          createVendor('Til-Gud Vendors', 'Catering'),
          createVendor('Kite Flying Instructors', 'Entertainment'),
          createVendor('Traditional Decorators', 'Decoration'),
          ...commonVendors.entertainment,
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'easter-celebration',
        name: 'Easter Celebration',
        vendors: [
          createVendor('Easter Egg Suppliers', 'Entertainment'),
          createVendor('Bunny Costume Services', 'Entertainment'),
          createVendor('Church Decorators', 'Decoration'),
          createVendor('Easter Cake Bakers', 'Catering'),
          ...commonVendors.decoration,
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },
    ],
  },
  {
    id: 'political',
    name: 'Political and Civic Events',
    icon: 'Flag',
    subsections: [
      {
        id: 'charity-event',
        name: 'Charity Event',
        vendors: [
          ...commonVendors.coordination,
          ...commonVendors.catering,
          ...commonVendors.entertainment,
          ...commonVendors.photography,
          createVendor('Auction Coordinators', 'Services'),
        ],
      },
      {
        id: 'political-rally',
        name: 'Political Rally',
        vendors: [
          ...commonVendors.security,
          ...commonVendors.technical,
          createVendor('Stage Managers', 'Technical'),
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'election-campaign',
        name: 'Election Campaign',
        vendors: [
          createVendor('PR Agencies', 'Services'),
          ...commonVendors.technical,
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'political-conference',
        name: 'Political Conference',
        vendors: [
          createVendor('Keynote Speakers', 'Speaking'),
          ...commonVendors.technical,
          ...commonVendors.catering,
          ...commonVendors.coordination,
        ],
      },
      {
        id: 'party-convention',
        name: 'Party Convention',
        vendors: [
          ...commonVendors.security,
          createVendor('Sound Engineers', 'Technical'),
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'swearing-in-ceremony',
        name: 'Swearing-in Ceremony',
        vendors: [
          createVendor('Officiants', 'Religious'),
          ...commonVendors.photography,
          ...commonVendors.decoration,
          ...commonVendors.security,
        ],
      },
      {
        id: 'political-summit',
        name: 'Political Summit',
        vendors: [
          createVendor('Speakers', 'Speaking'),
          createVendor('Interpreters', 'Services'),
          ...commonVendors.catering,
          createVendor('AV Production', 'Technical'),
        ],
      },



      {
        id: 'community-town-hall',
        name: 'Community Town Hall',
        vendors: [
          ...commonVendors.technical,
          createVendor('Moderators', 'Speaking'),
          ...commonVendors.catering,
        ],
      },

    ],
  },
  {
    id: 'sports',
    name: 'Sports and Recreational Events',
    icon: 'Trophy',
    subsections: [
      {
        id: 'sports-tournament',
        name: 'Sports Tournament',
        vendors: [
          createVendor('Outdoor Venue', 'venue'),
          createVendor('Community Hall', 'venue'),
          createVendor('Equipment Suppliers', 'Services'),
          createVendor('Referees', 'Services'),
          createVendor('Medical Services', 'Services'),
          ...commonVendors.catering,
          ...commonVendors.photography,
          createVendor('Scorekeepers', 'Services'),
        ],
      },
      {
        id: 'marathon-run',
        name: 'Marathon Run',
        vendors: [
          createVendor('Timing Services', 'Services'),
          createVendor('Medical Teams', 'Services'),
          createVendor('Water Stations', 'Services'),
          ...commonVendors.photography,
        ],
      },
      {
        id: 'adventure-camp',
        name: 'Adventure Camp',
        vendors: [
          createVendor('Gear Rental', 'Services'),
          createVendor('Instructors', 'Speaking'),
          createVendor('Medical Services', 'Services'),
          ...commonVendors.catering,
        ],
      },



      {
        id: 'cycling-event',
        name: 'Cycling Event',
        vendors: [
          createVendor('Route Markers', 'Services'),
          createVendor('Medical Services', 'Services'),
          ...commonVendors.photography,
        ],
      },

      {
        id: 'sports-day',
        name: 'Sports Day',
        vendors: [
          createVendor('Equipment Suppliers', 'Services'),
          createVendor('Referees', 'Services'),
          ...commonVendors.catering,
        ],
      },

    ],
  },
  {
    id: 'educational',
    name: 'Educational Events',
    icon: 'GraduationCap',
    subsections: [
      {
        id: 'workshop',
        name: 'Workshop',
        vendors: [
          createVendor('Facilitators', 'Speaking'),
          ...commonVendors.technical,
          ...commonVendors.catering,
          createVendor('Materials Suppliers', 'Services'),
        ],
      },
      {
        id: 'lecture-series',
        name: 'Lecture Series',
        vendors: [
          createVendor('Speakers', 'Speaking'),
          ...commonVendors.technical,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'school-annual-day',
        name: 'School Annual Day',
        vendors: [
          createVendor('Performers', 'Entertainment'),
          ...commonVendors.decoration,
          ...commonVendors.photography,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'science-fair',
        name: 'Science Fair',
        vendors: [
          createVendor('Judges', 'Services'),
          createVendor('Materials Suppliers', 'Services'),
          ...commonVendors.photography,
        ],
      },

      {
        id: 'academic-symposium',
        name: 'Academic Symposium',
        vendors: [
          createVendor('Speakers', 'Speaking'),
          ...commonVendors.technical,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'research-conference',
        name: 'Research Conference',
        vendors: [
          createVendor('Keynote Speakers', 'Speaking'),
          createVendor('AV Production', 'Technical'),
          ...commonVendors.catering,
        ],
      },
      {
        id: 'debate-competition',
        name: 'Debate Competition',
        vendors: [
          createVendor('Moderators', 'Speaking'),
          ...commonVendors.technical,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'quiz-contest',
        name: 'Quiz Contest',
        vendors: [
          createVendor('Hosts', 'Speaking'),
          ...commonVendors.technical,
          createVendor('Prizes Suppliers', 'Services'),
        ],
      },
      {
        id: 'literary-festival',
        name: 'Literary Festival',
        vendors: [
          createVendor('Authors', 'Speaking'),
          ...commonVendors.catering,
          ...commonVendors.photography,
        ],
      },
    ],
  },
  {
    id: 'health',
    name: 'Health and Wellness Events',
    icon: 'Activity',
    subsections: [


      {
        id: 'health-camp',
        name: 'Health Camp',
        vendors: [
          createVendor('Medical Suppliers', 'Services'),
          createVendor('Instructors', 'Speaking'),
          ...commonVendors.catering,
        ],
      },
      {
        id: 'mental-health-awareness-event',
        name: 'Mental Health Awareness Event',
        vendors: [
          createVendor('Speakers', 'Speaking'),
          createVendor('Facilitators', 'Speaking'),
          ...commonVendors.catering,
        ],
      },
      {
        id: 'fitness-bootcamp',
        name: 'Fitness Bootcamp',
        vendors: [
          createVendor('Trainers', 'Speaking'),
          createVendor('Equipment', 'Services'),
          createVendor('Medical Services', 'Services'),
        ],
      },


      {
        id: 'health-fair',
        name: 'Health Fair',
        vendors: [
          createVendor('Medical Vendors', 'Services'),
          createVendor('Exhibitors', 'Services'),
          ...commonVendors.catering,
        ],
      },
      {
        id: 'blood-donation-drive',
        name: 'Blood Donation Drive',
        vendors: [
          createVendor('Medical Teams', 'Services'),
          createVendor('Blood Banks', 'Services'),
          ...commonVendors.coordination,
        ],
      },



      {
        id: 'health-screening',
        name: 'Health Screening',
        vendors: [
          createVendor('Medical Equipment', 'Services'),
          createVendor('Healthcare Professionals', 'Services'),
          ...commonVendors.coordination,
        ],
      },
      {
        id: 'medical-conference',
        name: 'Medical Conference',
        vendors: [
          createVendor('Medical Speakers', 'Speaking'),
          ...commonVendors.technical,
          ...commonVendors.catering,
          ...commonVendors.coordination,
        ],
      },
      {
        id: 'vaccination-drive',
        name: 'Vaccination Drive',
        vendors: [
          createVendor('Medical Teams', 'Services'),
          createVendor('Vaccine Suppliers', 'Services'),
          ...commonVendors.coordination,
        ],
      },
      {
        id: 'health-awareness-campaign',
        name: 'Health Awareness Campaign',
        vendors: [
          createVendor('Health Educators', 'Speaking'),
          createVendor('Campaign Materials', 'Services'),
          ...commonVendors.photography,
        ],
      },
    ],
  },
  {
    id: 'environmental',
    name: 'Environmental Events',
    icon: 'Leaf',
    subsections: [
      {
        id: 'tree-planting-drive',
        name: 'Tree Planting Drive',
        vendors: [
          createVendor('Outdoor Venue', 'venue'),
          createVendor('Garden Venue', 'venue'),
          createVendor('Tree Suppliers', 'Services'),
          createVendor('Nursery Partners', 'Services'),
          createVendor('Landscapers', 'Services'),
          createVendor('Environmental Educators', 'Speaking'),
          createVendor('Volunteer Coordinators', 'Coordination'),
          createVendor('Planting Equipment Rental', 'Services'),
        ],
      },
      {
        id: 'eco-festival',
        name: 'Eco-Festival',
        vendors: [
          createVendor('Sustainable Vendors', 'Services'),
          createVendor('Artisans', 'Services'),
          createVendor('Caterers (Organic Food)', 'Catering'),
        ],
      },

      {
        id: 'clean-up-drive',
        name: 'Clean-Up Drive',
        vendors: [
          createVendor('Waste Management Services', 'Services'),
          createVendor('Tools Suppliers', 'Services'),
        ],
      },
      {
        id: 'environmental-awareness-campaign',
        name: 'Environmental Awareness Campaign',
        vendors: [
          createVendor('PR Agencies', 'Services'),
          createVendor('Educators', 'Speaking'),
          ...commonVendors.photography,
        ],
      },
      {
        id: 'green-living-expo',
        name: 'Green Living Expo',
        vendors: [
          createVendor('Exhibitors', 'Services'),
          createVendor('Sustainable Product Vendors', 'Services'),
          ...commonVendors.catering,
        ],
      },
    ],
  },
  {
    id: 'virtual',
    name: 'Virtual/Hybrid Events',
    icon: 'Monitor',
    subsections: [
      {
        id: 'online-webinar',
        name: 'Online Webinar',
        vendors: [
          createVendor('Virtual Platform Providers', 'Technical'),
          createVendor('Moderators', 'Speaking'),
          createVendor('Tech Support', 'Technical'),
        ],
      },
      {
        id: 'virtual-conference',
        name: 'Virtual Conference',
        vendors: [
          createVendor('Streaming Services', 'Technical'),
          createVendor('AV Production', 'Technical'),
          createVendor('Virtual Networking Tools', 'Technical'),
        ],
      },
      {
        id: 'live-stream-party',
        name: 'Live Stream Party',
        vendors: [
          createVendor('Streaming Platforms', 'Technical'),
          createVendor('Entertainers', 'Entertainment'),
          createVendor('Tech Support', 'Technical'),
        ],
      },
      {
        id: 'virtual-team-building-event',
        name: 'Virtual Team Building Event',
        vendors: [
          createVendor('Activity Facilitators', 'Speaking'),
          createVendor('Virtual Tools Providers', 'Technical'),
        ],
      },
      {
        id: 'online-product-launch',
        name: 'Online Product Launch',
        vendors: [
          createVendor('Digital Marketers', 'Services'),
          ...commonVendors.technical,
          createVendor('Virtual Exhibitors', 'Services'),
        ],
      },
      {
        id: 'virtual-charity-auction',
        name: 'Virtual Charity Auction',
        vendors: [
          createVendor('Auction Software Providers', 'Technical'),
          createVendor('Moderators', 'Speaking'),
        ],
      },
      {
        id: 'hybrid-festival-celebration',
        name: 'Hybrid Festival Celebration',
        vendors: [
          createVendor('Hybrid Platform Providers', 'Technical'),
          createVendor('AV Teams', 'Technical'),
          createVendor('Entertainers', 'Entertainment'),
        ],
      },
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment Events',
    icon: 'Music',
    subsections: [
      {
        id: 'dance-performance',
        name: 'Dance Performance',
        vendors: [
          createVendor('Dancers', 'Entertainment'),
          createVendor('Choreographers', 'Entertainment'),
          ...commonVendors.technical,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'comedy-show',
        name: 'Comedy Show',
        vendors: [
          createVendor('Comedians', 'Entertainment'),
          ...commonVendors.technical,
          ...commonVendors.photography,
          createVendor('Ticket Services', 'Services'),
        ],
      },
      {
        id: 'theater-play',
        name: 'Theater Play',
        vendors: [
          createVendor('Actors', 'Entertainment'),
          createVendor('Stage Designers', 'Technical'),
          ...commonVendors.technical,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'fashion-show',
        name: 'Fashion Show',
        vendors: [
          createVendor('Models', 'Entertainment'),
          createVendor('Fashion Designers', 'Services'),
          ...commonVendors.technical,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'magic-show',
        name: 'Magic Show',
        vendors: [
          createVendor('Magicians', 'Entertainment'),
          ...commonVendors.technical,
          ...commonVendors.photography,
        ],
      },

      {
        id: 'storytelling-session',
        name: 'Storytelling Session',
        vendors: [
          createVendor('Storytellers', 'Entertainment'),
          ...commonVendors.coordination,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'karaoke-night',
        name: 'Karaoke Night',
        vendors: [
          createVendor('Karaoke Equipment', 'Technical'),
          ...commonVendors.entertainment,
          ...commonVendors.catering,
        ],
      },
      {
        id: 'open-mic-night',
        name: 'Open Mic Night',
        vendors: [
          createVendor('Sound Equipment', 'Technical'),
          createVendor('Hosts', 'Entertainment'),
          ...commonVendors.catering,
        ],
      },
      {
        id: 'film-screening',
        name: 'Film Screening',
        vendors: [
          createVendor('Projection Equipment', 'Technical'),
          createVendor('Film Distributors', 'Services'),
          ...commonVendors.catering,
        ],
      },
      {
        id: 'poetry-reading',
        name: 'Poetry Reading',
        vendors: [
          createVendor('Poets', 'Entertainment'),
          ...commonVendors.technical,
          ...commonVendors.catering,
        ],
      },



      {
        id: 'celebrity-meet-greet',
        name: 'Celebrity Meet & Greet',
        vendors: [
          createVendor('Celebrity Management', 'Services'),
          ...commonVendors.security,
          ...commonVendors.photography,
          ...commonVendors.coordination,
        ],
      },
    ],
  },
  {
    id: 'community',
    name: 'Community Events',
    icon: 'Users',
    subsections: [
      {
        id: 'neighborhood-gathering',
        name: 'Neighborhood Gathering',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.coordination,
          ...commonVendors.entertainment,
        ],
      },



      {
        id: 'volunteer-appreciation',
        name: 'Volunteer Appreciation',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.photography,
          createVendor('Award Suppliers', 'Services'),
        ],
      },
      {
        id: 'fundraising-gala',
        name: 'Fundraising Gala',
        vendors: [
          ...commonVendors.catering,
          ...commonVendors.entertainment,
          ...commonVendors.photography,
          createVendor('Auction Coordinators', 'Services'),
        ],
      },

      {
        id: 'community-festival',
        name: 'Community Festival',
        vendors: [
          ...commonVendors.entertainment,
          ...commonVendors.catering,
          ...commonVendors.decoration,
          ...commonVendors.photography,
        ],
      },
      {
        id: 'senior-citizen-program',
        name: 'Senior Citizen Program',
        vendors: [
          createVendor('Activity Coordinators', 'Services'),
          ...commonVendors.catering,
          createVendor('Healthcare Support', 'Services'),
        ],
      },
      {
        id: 'youth-development-program',
        name: 'Youth Development Program',
        vendors: [
          createVendor('Youth Mentors', 'Speaking'),
          createVendor('Activity Coordinators', 'Services'),
          ...commonVendors.coordination,
        ],
      },
    ],
  },
];