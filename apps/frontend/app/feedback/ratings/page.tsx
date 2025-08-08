'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';

export default function FeedbackRatingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customer Feedback & Ratings</h1>
          <p className="text-text-secondary">Monitor customer satisfaction and service quality</p>
        </div>
        <Button>
          <TrendingUp className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">4.8</div>
            <p className="text-text-secondary text-sm">Out of 5 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">127</div>
            <p className="text-text-secondary text-sm">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Satisfaction Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">96%</div>
            <p className="text-text-secondary text-sm">Very satisfied customers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 border border-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-text-secondary">John D. - Vancouver Move</span>
                </div>
                <p className="text-text-primary">
                  "Excellent service! The crew was professional and careful with our belongings. 
                  Everything arrived on time and in perfect condition."
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 border border-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                    <Star className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-sm text-text-secondary">Sarah M. - Office Relocation</span>
                </div>
                <p className="text-text-primary">
                  "Good overall experience. The team was efficient, though there was a slight delay 
                  in the morning. Would recommend with minor reservations."
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
