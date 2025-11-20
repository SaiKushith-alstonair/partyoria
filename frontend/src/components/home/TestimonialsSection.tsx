import { Star, StarHalf } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TestimonialProps {
  rating: number;
  content: string;
  author: {
    name: string;
    location: string;
    image: string;
  };
}

const Testimonial = ({ rating, content, author }: TestimonialProps) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-[#FFD700] text-[#FFD700]" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-[#FFD700] text-[#FFD700]" />);
    }

    return stars;
  };

  return (
    <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition duration-300">
      <div className="text-[#FFD700] mb-4 flex">
        {renderStars()}
      </div>
      <p className="text-gray-600 mb-6 italic">{content}</p>
      <div className="flex items-center">
        <Avatar className="h-12 w-12">
          <AvatarImage src={author.image} alt={author.name} />
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h4 className="font-semibold">{author.name}</h4>
          <p className="text-gray-500 text-sm">{author.location}</p>
        </div>
      </div>
    </div>
  );
};

export default function TestimonialsSection() {
  const testimonials = [
    {
      rating: 5,
      content: "\"Partyoria made planning our daughter's wedding so seamless! We found an amazing venue and connected with top-notch vendors all in one place.\"",
      author: {
        name: "Priya Sharma",
        location: "Wedding in Mumbai",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
      }
    },
    {
      rating: 5,
      content: "\"As a corporate event manager, I rely on Partyoria for all our conferences. The platform has consistently connected us with professional vendors across different cities.\"",
      author: {
        name: "Rahul Mehta",
        location: "Corporate Events, Delhi",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
      }
    },
    {
      rating: 4.5,
      content: "\"The decorators we found through Partyoria transformed our anniversary celebration into something magical. The platform is so easy to use and the vendor options are excellent.\"",
      author: {
        name: "Ananya and Vikram",
        location: "Anniversary, Jaipur",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
      }
    }
  ];

  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[#FF5A5F] font-semibold">TESTIMONIALS</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 font-heading">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from people who have created unforgettable moments with Partyoria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial 
              key={index}
              rating={testimonial.rating}
              content={testimonial.content}
              author={testimonial.author}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
