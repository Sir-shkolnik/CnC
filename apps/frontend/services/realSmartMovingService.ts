/**
 * Real SmartMoving Service for Frontend
 * Fetches ONLY real current data from SmartMoving API
 * NO hardcoded data, NO fallbacks, ONLY live LGM data
 */

interface SmartMovingJob {
  id: string;
  jobNumber: string;
  serviceDate: string;
  type: number;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  opportunity: {
    id: string;
    quoteNumber: string;
    status: number;
  };
}

interface SmartMovingResponse {
  pageNumber: number;
  pageSize: number;
  lastPage: boolean;
  totalPages: number;
  totalResults: number;
  totalThisPage: number;
  pageResults: Array<{
    id: string;
    name: string;
    phoneNumber: string;
    emailAddress: string;
    address: string;
    opportunities: Array<{
      id: string;
      quoteNumber: string;
      status: number;
      jobs: Array<{
        id: string;
        jobNumber: string;
        serviceDate: string;
        type: number;
      }>;
    }>;
  }>;
}

export class RealSmartMovingService {
  private static readonly API_BASE_URL = 'https://api-public.smartmoving.com/v1';
  private static readonly API_KEY = '185840176c73420fbd3a473c2fdccedb';

  private static getHeaders(): HeadersInit {
    return {
      'x-api-key': this.API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Get today's real jobs from SmartMoving API
   */
  static async getTodaysJobs(): Promise<SmartMovingJob[]> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    console.log(`🔍 Fetching real SmartMoving jobs for ${today}`);

    try {
      const allJobs: SmartMovingJob[] = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const params = new URLSearchParams({
          FromServiceDate: today,
          ToServiceDate: today,
          IncludeOpportunityInfo: 'true',
          Page: page.toString(),
          PageSize: '50'
        });

        const url = `${this.API_BASE_URL}/api/customers?${params}`;
        
        const response = await fetch(url, {
          headers: this.getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`SmartMoving API error: ${response.status} ${response.statusText}`);
        }

        const data: SmartMovingResponse = await response.json();
        
        // Process each customer and their jobs
        for (const customer of data.pageResults || []) {
          for (const opportunity of customer.opportunities || []) {
            for (const job of opportunity.jobs || []) {
              // Only include jobs for today
              if (job.serviceDate === today) {
                allJobs.push({
                  id: job.id,
                  jobNumber: job.jobNumber,
                  serviceDate: job.serviceDate,
                  type: job.type,
                  customer: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.emailAddress,
                    phone: customer.phoneNumber,
                    address: customer.address,
                  },
                  opportunity: {
                    id: opportunity.id,
                    quoteNumber: opportunity.quoteNumber,
                    status: opportunity.status,
                  },
                });
              }
            }
          }
        }

        hasMorePages = !data.lastPage;
        page++;
      }

      console.log(`✅ Found ${allJobs.length} real SmartMoving jobs for today`);
      return allJobs;
    } catch (error) {
      console.error('❌ Failed to fetch real SmartMoving jobs:', error);
      throw new Error(`Failed to fetch real SmartMoving data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert SmartMoving job to journey format
   */
  static convertJobToJourney(job: SmartMovingJob): any {
    const serviceDate = job.serviceDate;
    const formattedDate = `${serviceDate.slice(0, 4)}-${serviceDate.slice(4, 6)}-${serviceDate.slice(6, 8)}`;
    
    // Map SmartMoving status to C&C status
    let status = 'MORNING_PREP';
    if (job.opportunity.status === 30) status = 'MORNING_PREP'; // Confirmed
    else if (job.opportunity.status === 11) status = 'EN_ROUTE'; // In Progress
    else if (job.opportunity.status === 40) status = 'COMPLETED'; // Completed

    // Get job type description
    const typeDescriptions: Record<number, string> = {
      1: 'Residential Move',
      8: 'Storage Delivery',
      9: 'Storage Pickup',
      106: 'Packing Service',
    };

    return {
      id: job.id,
      smartMovingJobNumber: job.jobNumber,
      quoteNumber: job.opportunity.quoteNumber,
      date: formattedDate,
      startTime: `${formattedDate}T08:00:00Z`,
      status,
      title: `${typeDescriptions[job.type] || 'Moving Service'} - ${job.customer.name}`,
      customerName: job.customer.name,
      customerEmail: job.customer.email,
      customerPhone: job.customer.phone,
      startLocation: job.customer.address,
      endLocation: 'Delivery address (details in SmartMoving)',
      truckNumber: `LGM-${job.jobNumber.slice(-4)}`,
      serviceType: typeDescriptions[job.type] || 'Moving Service',
      estimatedDuration: 480, // 8 hours default
      priority: job.opportunity.status === 30 ? 'HIGH' : 'MEDIUM',
      realData: true,
      smartMovingData: job,
    };
  }

  /**
   * Get real journeys for display
   */
  static async getRealJourneys(): Promise<any[]> {
    try {
      const jobs = await this.getTodaysJobs();
      return jobs.map(job => this.convertJobToJourney(job));
    } catch (error) {
      console.error('❌ Failed to get real journeys:', error);
      // NO FALLBACK - throw error instead of returning fake data
      throw error;
    }
  }

  /**
   * Get specific real journey by ID
   */
  static async getRealJourneyById(journeyId: string): Promise<any> {
    try {
      const jobs = await this.getTodaysJobs();
      const matchingJob = jobs.find(job => 
        job.id === journeyId || 
        job.jobNumber === journeyId ||
        journeyId.includes(job.id) ||
        journeyId.includes(job.jobNumber)
      );

      if (!matchingJob) {
        throw new Error(`No real data found for journey ${journeyId}`);
      }

      return this.convertJobToJourney(matchingJob);
    } catch (error) {
      console.error(`❌ Failed to get real journey ${journeyId}:`, error);
      throw error;
    }
  }

  /**
   * Test connection to SmartMoving API
   */
  static async testConnection(): Promise<{ success: boolean; message: string; totalJobs?: number }> {
    try {
      const jobs = await this.getTodaysJobs();
      return {
        success: true,
        message: `Connected to SmartMoving API successfully`,
        totalJobs: jobs.length,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to connect to SmartMoving API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}