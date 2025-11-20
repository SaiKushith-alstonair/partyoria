import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Star, ThumbsUp, MessageCircle, TrendingUp, CheckCircle } from "lucide-react";

const Reviews = () => {
  const vendorData = JSON.parse(localStorage.getItem("vendorOnboarding") || "{}");
  const vendorBusiness = vendorData.business || "Photography";

  const getReviewsByCategory = (category: string) => {
    const reviewsByCategory = {
      Photography: {
        recentReviews: [
          {
            id: 1,
            name: "Priya Sharma",
            initials: "PS",
            rating: 5,
            service: "Wedding Photography",
            date: "15 Feb 2024",
            comment: "Absolutely amazing photography! Captured every moment beautifully. Highly recommend for weddings.",
            verified: true,
            helpful: 12,
          },
          {
            id: 2,
            name: "Rajesh Kumar",
            initials: "RK",
            rating: 4,
            service: "Candid Photography",
            date: "10 Feb 2024",
            comment: "Great candid shots! Natural and beautiful photos. Professional service throughout.",
            verified: true,
            helpful: 8,
          },
        ],
      },
      Catering: {
        recentReviews: [
          {
            id: 1,
            name: "Anita Desai",
            initials: "AD",
            rating: 5,
            service: "Wedding Catering",
            date: "15 Feb 2024",
            comment: "Excellent food quality and service! All guests loved the variety and taste. Highly professional team.",
            verified: true,
            helpful: 15,
          },
          {
            id: 2,
            name: "Vikram Singh",
            initials: "VS",
            rating: 4,
            service: "Corporate Catering",
            date: "10 Feb 2024",
            comment: "Great catering service for our office event. Food was delicious and service was prompt.",
            verified: true,
            helpful: 6,
          },
        ],
      },
      Decoration: {
        recentReviews: [
          {
            id: 1,
            name: "Meera Patel",
            initials: "MP",
            rating: 5,
            service: "Wedding Decoration",
            date: "15 Feb 2024",
            comment: "Beautiful decoration work! The team was professional and delivered exactly what we wanted.",
            verified: true,
            helpful: 18,
          },
          {
            id: 2,
            name: "Arjun Sharma",
            initials: "AS",
            rating: 4,
            service: "Birthday Decoration",
            date: "10 Feb 2024",
            comment: "Creative and colorful decorations. Made the party venue look amazing. Good value for money.",
            verified: false,
            helpful: 9,
          },
        ],
      },
      DJ: {
        recentReviews: [
          {
            id: 1,
            name: "Rohit Kumar",
            initials: "RK",
            rating: 5,
            service: "Wedding DJ",
            date: "15 Feb 2024",
            comment: "Amazing music selection! Kept everyone dancing all night. Professional setup and great sound quality.",
            verified: true,
            helpful: 14,
          },
          {
            id: 2,
            name: "Sneha Gupta",
            initials: "SG",
            rating: 4,
            service: "Party DJ",
            date: "10 Feb 2024",
            comment: "Good music selection and equipment. The DJ kept the crowd engaged throughout the event.",
            verified: true,
            helpful: 7,
          },
        ],
      },
      "Event Manager": {
        recentReviews: [
          {
            id: 1,
            name: "Kavya Sharma",
            initials: "KS",
            rating: 5,
            service: "Wedding Management",
            date: "15 Feb 2024",
            comment: "Exceptional event management! Everything was perfectly coordinated. Stress-free wedding planning experience.",
            verified: true,
            helpful: 20,
          },
          {
            id: 2,
            name: "Amit Patel",
            initials: "AP",
            rating: 4,
            service: "Corporate Event",
            date: "10 Feb 2024",
            comment: "Professional event management for our company annual meet. Well organized and executed.",
            verified: true,
            helpful: 12,
          },
        ],
      },
      Transportation: {
        recentReviews: [
          {
            id: 1,
            name: "Ravi Kumar",
            initials: "RK",
            rating: 5,
            service: "Wedding Car Rental",
            date: "15 Feb 2024",
            comment: "Beautiful decorated cars for our wedding! Professional drivers and excellent service throughout.",
            verified: true,
            helpful: 16,
          },
          {
            id: 2,
            name: "Neha Singh",
            initials: "NS",
            rating: 4,
            service: "Airport Transfer",
            date: "10 Feb 2024",
            comment: "Reliable and punctual service. Clean vehicles and courteous drivers. Good value for money.",
            verified: false,
            helpful: 8,
          },
        ],
      },
      Florist: {
        recentReviews: [
          {
            id: 1,
            name: "Pooja Mehta",
            initials: "PM",
            rating: 5,
            service: "Wedding Flowers",
            date: "15 Feb 2024",
            comment: "Absolutely stunning floral arrangements! Fresh flowers and beautiful designs. Exceeded expectations.",
            verified: true,
            helpful: 18,
          },
          {
            id: 2,
            name: "Suresh Gupta",
            initials: "SG",
            rating: 4,
            service: "Corporate Arrangements",
            date: "10 Feb 2024",
            comment: "Professional floral arrangements for our office. Fresh flowers delivered on time every week.",
            verified: true,
            helpful: 10,
          },
        ],
      },
      Baker: {
        recentReviews: [
          {
            id: 1,
            name: "Deepika Rao",
            initials: "DR",
            rating: 5,
            service: "Wedding Cake",
            date: "15 Feb 2024",
            comment: "Amazing wedding cake! Beautiful design and delicious taste. All guests loved it. Highly recommended!",
            verified: true,
            helpful: 22,
          },
          {
            id: 2,
            name: "Arjun Malhotra",
            initials: "AM",
            rating: 4,
            service: "Birthday Cake",
            date: "10 Feb 2024",
            comment: "Great custom birthday cake for my daughter. Creative design and tasty. Good value for money.",
            verified: false,
            helpful: 11,
          },
        ],
      },
      Videography: {
        recentReviews: [
          {
            id: 1,
            name: "Sanjay Verma",
            initials: "SV",
            rating: 5,
            service: "Wedding Videography",
            date: "15 Feb 2024",
            comment: "Cinematic wedding video! Professional quality and beautiful storytelling. Captured all precious moments perfectly.",
            verified: true,
            helpful: 25,
          },
          {
            id: 2,
            name: "Priya Joshi",
            initials: "PJ",
            rating: 4,
            service: "Corporate Video",
            date: "10 Feb 2024",
            comment: "Professional corporate video production. Good quality and delivered on time. Satisfied with the output.",
            verified: true,
            helpful: 13,
          },
        ],
      },
      "Makeup Artist": {
        recentReviews: [
          {
            id: 1,
            name: "Ritika Sharma",
            initials: "RS",
            rating: 5,
            service: "Bridal Makeup",
            date: "15 Feb 2024",
            comment: "Perfect bridal makeup! Looked stunning throughout the day. Professional and skilled artist. Highly recommend!",
            verified: true,
            helpful: 19,
          },
          {
            id: 2,
            name: "Anjali Gupta",
            initials: "AG",
            rating: 4,
            service: "Party Makeup",
            date: "10 Feb 2024",
            comment: "Beautiful party makeup for my anniversary. Long-lasting and looked great in photos. Good service.",
            verified: false,
            helpful: 9,
          },
        ],
      },
      "Hair Stylist": {
        recentReviews: [
          {
            id: 1,
            name: "Simran Kaur",
            initials: "SK",
            rating: 5,
            service: "Bridal Hairstyle",
            date: "15 Feb 2024",
            comment: "Gorgeous bridal hairstyle! Stayed perfect all day long. Creative and professional stylist. Loved the result!",
            verified: true,
            helpful: 17,
          },
          {
            id: 2,
            name: "Manish Agarwal",
            initials: "MA",
            rating: 4,
            service: "Party Hairstyle",
            date: "10 Feb 2024",
            comment: "Great hairstyling for the party. Modern and trendy look. Professional service and good value.",
            verified: true,
            helpful: 7,
          },
        ],
      },
      "Fashion Designer": {
        recentReviews: [
          {
            id: 1,
            name: "Nisha Reddy",
            initials: "NR",
            rating: 5,
            service: "Bridal Wear",
            date: "15 Feb 2024",
            comment: "Stunning bridal lehenga! Perfect fit and beautiful design. Excellent craftsmanship and attention to detail.",
            verified: true,
            helpful: 24,
          },
          {
            id: 2,
            name: "Rahul Khanna",
            initials: "RK",
            rating: 4,
            service: "Custom Design",
            date: "10 Feb 2024",
            comment: "Great custom suit design. Good quality fabric and tailoring. Professional service throughout the process.",
            verified: false,
            helpful: 12,
          },
        ],
      },
      "Gift Services": {
        recentReviews: [
          {
            id: 1,
            name: "Aditi Jain",
            initials: "AJ",
            rating: 5,
            service: "Wedding Favors",
            date: "15 Feb 2024",
            comment: "Beautiful wedding return gifts! Creative packaging and good quality items. Guests loved them. Excellent service!",
            verified: true,
            helpful: 16,
          },
          {
            id: 2,
            name: "Vikash Kumar",
            initials: "VK",
            rating: 4,
            service: "Corporate Gifts",
            date: "10 Feb 2024",
            comment: "Professional corporate gift hampers. Good quality products and nice presentation. Delivered on time.",
            verified: true,
            helpful: 8,
          },
        ],
      },
      Entertainment: {
        recentReviews: [
          {
            id: 1,
            name: "Rajesh Iyer",
            initials: "RI",
            rating: 5,
            service: "Live Band",
            date: "15 Feb 2024",
            comment: "Amazing live band performance! Great music and energy. Made our wedding celebration unforgettable. Highly recommended!",
            verified: true,
            helpful: 21,
          },
          {
            id: 2,
            name: "Sunita Devi",
            initials: "SD",
            rating: 4,
            service: "Dance Troupe",
            date: "10 Feb 2024",
            comment: "Excellent dance performance for our cultural event. Professional dancers and well-choreographed routines.",
            verified: false,
            helpful: 14,
          },
        ],
      },
      Lighting: {
        recentReviews: [
          {
            id: 1,
            name: "Manoj Singh",
            initials: "MS",
            rating: 5,
            service: "Wedding Lighting",
            date: "15 Feb 2024",
            comment: "Spectacular lighting setup! Created perfect ambiance for our wedding. Professional team and excellent execution.",
            verified: true,
            helpful: 18,
          },
          {
            id: 2,
            name: "Geeta Sharma",
            initials: "GS",
            rating: 4,
            service: "Stage Lighting",
            date: "10 Feb 2024",
            comment: "Good stage lighting for our cultural program. Enhanced the overall presentation. Professional service.",
            verified: true,
            helpful: 11,
          },
        ],
      },
    };
    
    return reviewsByCategory[category as keyof typeof reviewsByCategory] || reviewsByCategory.Photography;
  };

  const categoryData = getReviewsByCategory(vendorBusiness);
  const reviewsData = {
    averageRating: 4.5,
    totalReviews: 4,
    monthlyIncrease: 2,
    fiveStarReviews: 2,
    fiveStarPercentage: 50,
    verifiedReviews: 3,
    verifiedPercentage: 75,
    ratingBreakdown: {
      5: 2,
      4: 2,
      3: 0,
      2: 0,
      1: 0,
    },
    recentReviews: categoryData.recentReviews,
  };

  const renderStars = (rating: number, size = "w-4 h-4") => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Reviews & Ratings</h1>
        <p className="text-muted-foreground">Monitor your client feedback and service ratings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-bold">{reviewsData.averageRating}</span>
                  <div className="flex">{renderStars(Math.floor(reviewsData.averageRating))}</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">({reviewsData.totalReviews} reviews)</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <span className="text-3xl font-bold">{reviewsData.totalReviews}</span>
                <p className="text-xs text-blue-600 mt-1">+{reviewsData.monthlyIncrease} this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">5-Star Reviews</p>
                <span className="text-3xl font-bold">{reviewsData.fiveStarReviews}</span>
                <p className="text-xs text-green-600 mt-1">{reviewsData.fiveStarPercentage}% of total</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Reviews</p>
                <span className="text-3xl font-bold">{reviewsData.verifiedReviews}</span>
                <p className="text-xs text-purple-600 mt-1">{reviewsData.verifiedPercentage}% verified</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reviews */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviewsData.recentReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-semibold">
                        {review.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{review.name}</h4>
                          {review.verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-600">for {review.service}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Helpful
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Rating Breakdown */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Rating Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-2">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(reviewsData.ratingBreakdown[rating as keyof typeof reviewsData.ratingBreakdown] / reviewsData.totalReviews) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-4">
                    {reviewsData.ratingBreakdown[rating as keyof typeof reviewsData.ratingBreakdown]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reviews;





