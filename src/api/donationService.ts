import type { Donation } from '../types';
import axiosInstance from './axiosInstance';

export interface DonationStatistics {
  summary: {
    total: number;
    available: number;
    claimed: number;
    claim_rate: number;
  };
  food_types: Array<{
    food_type: string;
    count: number;
  }>;
  clusters: Array<{
    center: [number, number];
    donations: number[];
    bounds: [[number, number], [number, number]];
    stats: {
      total: number;
      available: number;
      claimed: number;
      food_types: { [key: string]: number };
    };
  }>;
  recent_activity: Donation[];
  zoom_level: number;
}

export interface DonationFilters {
  lat_min?: number;
  lat_max?: number;
  lng_min?: number;
  lng_max?: number;
  zoom?: number;
}

class DonationService {
  // Get all donations
  async getDonations(): Promise<Donation[]> {
    const response = await axiosInstance.get('/donations/');
    return response.data;
  }

  // Get donation statistics
  async getStatistics(filters: DonationFilters = {}): Promise<DonationStatistics> {
    const params = new URLSearchParams();
    
    if (filters.lat_min !== undefined) params.append('lat_min', filters.lat_min.toString());
    if (filters.lat_max !== undefined) params.append('lat_max', filters.lat_max.toString());
    if (filters.lng_min !== undefined) params.append('lng_min', filters.lng_min.toString());
    if (filters.lng_max !== undefined) params.append('lng_max', filters.lng_max.toString());
    if (filters.zoom !== undefined) params.append('zoom', filters.zoom.toString());

    const response = await axiosInstance.get(`/donations/statistics/?${params.toString()}`);
    return response.data;
  }

  // Create a new donation
  async createDonation(donationData: Partial<Donation>): Promise<Donation> {
    const response = await axiosInstance.post('/donations/', donationData);
    return response.data;
  }

  // Update a donation
  async updateDonation(id: number, donationData: Partial<Donation>): Promise<Donation> {
    const response = await axiosInstance.put(`/donations/${id}/`, donationData);
    return response.data;
  }

  // Delete a donation
  async deleteDonation(id: number): Promise<void> {
    await axiosInstance.delete(`/donations/${id}/`);
  }

  // Claim a donation
  async claimDonation(id: number): Promise<{ success: string }> {
    const response = await axiosInstance.post(`/donations/${id}/claim/`);
    return response.data;
  }

  // Get a single donation
  async getDonationById(id: number): Promise<Donation> {
    const response = await axiosInstance.get(`/donations/${id}/`);
    return response.data;
  }

  // Admin methods
  async getAdminStats(): Promise<any> {
    const response = await axiosInstance.get('/admin/stats/');
    return response.data;
  }

  async getAllDonations(): Promise<Donation[]> {
    const response = await axiosInstance.get('/admin/donations/');
    return response.data;
  }

  async getClaimedDonationsByUser(userId: number): Promise<Donation[]> {
    const response = await axiosInstance.get(`/donations/claimed_by_user/?user_id=${userId}`);
    return response.data;
  }
}

export default new DonationService(); 