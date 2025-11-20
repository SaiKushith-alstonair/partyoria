import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  image: string;
  title: string;
  description: string;
  linkText: string;
}

const ServiceCard = ({ image, title, description, linkText }: ServiceCardProps) => (
  <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white group">
    <div className="overflow-hidden">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" 
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold mb-3 font-heading text-black">{title}</h3>
      <p className="text-black mb-4">{description}</p>
      <button 
        onClick={() => {
          window.location.href = '/signup';
        }}
        className="text-primary font-semibold hover:text-primary/80 transition duration-300 flex items-center cursor-pointer bg-transparent border-none p-0"
      >
        {linkText} <ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  </div>
);

export default function ServicesSection() {
  const services = [
    {
      image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      title: "Venue Selection",
      description: "Discover perfect venues for your events, from luxury hotels to charming gardens.",
      linkText: "Explore Venues"
    },
    {
      image: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      title: "Catering & Food",
      description: "Connect with top caterers offering diverse cuisines to delight your guests.",
      linkText: "Find Caterers"
    },
    {
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      title: "Decoration & Design",
      description: "Transform spaces with stunning decor themes for any occasion or celebration.",
      linkText: "View Decorators"
    },
    {
      image: "https://images.unsplash.com/photo-1551216223-37c8d1dbec5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      title: "Photography & Video",
      description: "Capture your special moments with professional photographers and videographers.",
      linkText: "Book Professionals"
    },
    {
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      title: "Entertainment",
      description: "Find bands, DJs, performers, and entertainment options for your event.",
      linkText: "Explore Entertainment"
    },
    {
      image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      title: "Event Planning",
      description: "Full-service event planning and coordination from start to finish.",
      linkText: "Hire Planners"
    }
  ];
  
  const eventsAcrossIndia = [
    {
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      title: "Delhi - Royal Weddings",
      description: "Luxurious wedding experiences in the capital with royal themes and traditional ceremonies.",
      linkText: "Explore Delhi Events"
    },
    {
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      title: "Mumbai - Corporate Events",
      description: "Professional corporate gatherings, product launches and conferences in the business capital.",
      linkText: "Explore Mumbai Events"
    },
    {
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      title: "Goa - Beach Celebrations",
      description: "Stunning beachside parties, pre-wedding events and destination weddings on scenic shores.",
      linkText: "Explore Goa Events"
    },
    {
      image: "https://th.bing.com/th/id/OIP.WU2MLks2xfGSlAu7uwGz6wHaEV?w=270&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
      title: "Rajasthan - Heritage Events",
      description: "Majestic celebrations in historic forts and palaces with rich cultural experiences.",
      linkText: "Explore Rajasthan Events"
    },
    {
      image: "https://th.bing.com/th/id/OIP.dk-QzCSeMD1pveotKIIcWgHaEK?w=308&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
      title: "Bangalore - Tech Conferences",
      description: "Modern tech events, startup meetups and innovative corporate gatherings in India's Silicon Valley.",
      linkText: "Explore Bangalore Events"
    },
    {
      image: "https://th.bing.com/th/id/OIP.Xd3up7GAFufuBxvGdlSh8AHaEH?w=335&h=186&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
      title: "Kerala - Cultural Festivals",
      description: "Traditional Kerala ceremonies, cultural celebrations and backwater destination events.",
      linkText: "Explore Kerala Events"
    }
  ];

  return (
    <section id="services" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold">OUR SERVICES</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 font-heading">
            Comprehensive Event Solutions
          </h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto">
            From intimate gatherings to grand celebrations, we offer everything you need to create magical moments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard 
              key={service.title}
              image={service.image}
              title={service.title}
              description={service.description}
              linkText={service.linkText}
            />
          ))}
        </div>
        
        <div className="text-center mt-24 mb-16">
          <span className="text-primary font-semibold">EVENTS ACROSS INDIA</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 font-heading">
            Discover Regional Specialties
          </h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto">
            Explore diverse event types that showcase the rich cultural tapestry of India from north to south.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventsAcrossIndia.map((event) => (
            <ServiceCard 
              key={event.title}
              image={event.image}
              title={event.title}
              description={event.description}
              linkText={event.linkText}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
