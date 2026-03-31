import { BusinessAction } from './api';

export interface DecisionCard {
  id: string;
  title: string;
  description: string;
  category: 'growth' | 'operational' | 'risk' | 'strategy' | 'asset' | 'marketing' | 'staff' | 'inventory' | 'upgrade' | 'compliance' | 'service';
  type: string;
  cost: number;
  monthlyCost: number;
  impact: {
    revenue: string;
    costs: string;
    risk: string;
    timeline: string;
  };
  requirements?: {
    minPhase?: string;
    minCash?: number;
    minMonth?: number;
  };
}

const TIER_MULTIPLIERS: Record<number, number> = { 1: 1.5, 2: 1.2, 3: 1.0 };

const BUSINESS_CARDS: Record<string, DecisionCard[]> = {
  restaurant: [
    { id: 'kitchen_equip', title: 'Kitchen Equipment', description: 'Industrial kitchen setup - increases capacity', category: 'asset', type: 'Kitchen Equipment', cost: 80000, monthlyCost: 0, impact: { revenue: '+20%', costs: '-80K', risk: 'Low', timeline: '1 month' }, requirements: { minCash: 50000 } },
    { id: 'delivery_setup', title: 'Delivery Partnership', description: 'Zomato/Swiggy partnership - reach more customers', category: 'service', type: 'Delivery Partnership', cost: 15000, monthlyCost: 8000, impact: { revenue: '+40%', costs: '-8K/mo', risk: 'Low', timeline: '1 week' } },
    { id: 'chef_hire', title: 'Hire Expert Chef', description: 'Skilled chef for better food quality', category: 'staff', type: 'Chef', cost: 0, monthlyCost: 45000, impact: { revenue: '+25%', costs: '-45K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'social_media', title: 'Social Media Marketing', description: 'Instagram/Facebook ads campaign', category: 'marketing', type: 'Social Media Ads', cost: 0, monthlyCost: 8000, impact: { revenue: '+35%', costs: '-8K/mo', risk: 'Low', timeline: '2 weeks' } },
    { id: 'furniture', title: 'Premium Furniture', description: 'Dining area furniture upgrade', category: 'asset', type: 'Furniture & Tables', cost: 40000, monthlyCost: 0, impact: { revenue: '+15%', costs: '-40K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'cold_storage', title: 'Cold Storage Unit', description: 'Walk-in freezer for fresh ingredients', category: 'asset', type: 'Cold Storage Unit', cost: 60000, monthlyCost: 3000, impact: { revenue: '+10%', costs: '-3K/mo', risk: 'Low', timeline: '1 month' } },
    { id: 'catering', title: 'Start Catering Service', description: 'Corporate event catering business', category: 'growth', type: 'Catering Setup', cost: 50000, monthlyCost: 0, impact: { revenue: '+50%', costs: '-50K', risk: 'Medium', timeline: '2 months' } },
    { id: 'license', title: 'FSSAI License', description: 'Get official food license', category: 'compliance', type: 'Food License', cost: 5000, monthlyCost: 0, impact: { revenue: '+10%', costs: '-5K', risk: 'Very Low', timeline: '1 month' } },
    { id: 'premium_interiors', title: 'Premium Interiors', description: 'Upscale restaurant ambiance', category: 'upgrade', type: 'Premium Interiors', cost: 100000, monthlyCost: 0, impact: { revenue: '+40%', costs: '-1L', risk: 'Medium', timeline: '3 months' } },
    { id: 'water_purifier', title: 'Water Purifier System', description: 'RO water system for quality', category: 'asset', type: 'Water Purifier', cost: 15000, monthlyCost: 500, impact: { revenue: '+5%', costs: '-500/mo', risk: 'Very Low', timeline: 'Immediate' } },
    { id: 'pos_system', title: 'Digital POS System', description: 'Billing & inventory management', category: 'asset', type: 'POS System', cost: 25000, monthlyCost: 500, impact: { revenue: '+15%', costs: '-25K', risk: 'Low', timeline: '1 week' } },
    { id: 'waitstaff', title: 'Hire Waitstaff (x2)', description: 'Better customer service', category: 'staff', type: 'Waitstaff', cost: 0, monthlyCost: 28000, impact: { revenue: '+20%', costs: '-28K/mo', risk: 'Low', timeline: 'Immediate' } },
  ],
  retail: [
    { id: 'store_setup', title: 'Store Setup', description: 'Complete retail store setup', category: 'asset', type: 'Store Setup', cost: 100000, monthlyCost: 0, impact: { revenue: '+30%', costs: '-1L', risk: 'Low', timeline: '1 month' } },
    { id: 'inventory', title: 'Buy Inventory Stock', description: 'Products to fill your shelves', category: 'inventory', type: 'Inventory Stock', cost: 80000, monthlyCost: 0, impact: { revenue: '+25%', costs: '-80K', risk: 'Low', timeline: 'Immediate' } },
    { id: 'sales_staff', title: 'Hire Sales Staff (x2)', description: 'Store associates for customer service', category: 'staff', type: 'Sales Staff', cost: 0, monthlyCost: 28000, impact: { revenue: '+25%', costs: '-28K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'cashier', title: 'Hire Cashier', description: 'Billing counter staff', category: 'staff', type: 'Cashier', cost: 0, monthlyCost: 18000, impact: { revenue: '+15%', costs: '-18K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'shelving', title: 'Premium Shelving', description: 'Better product display', category: 'asset', type: 'Shelving', cost: 30000, monthlyCost: 0, impact: { revenue: '+20%', costs: '-30K', risk: 'Low', timeline: '1 week' } },
    { id: 'security', title: 'Security System', description: 'CCTV and security setup', category: 'asset', type: 'Security System', cost: 25000, monthlyCost: 1000, impact: { revenue: '+5%', costs: '-1K/mo', risk: 'Very Low', timeline: '1 week' } },
    { id: 'shopping_bags', title: 'Branded Shopping Bags', description: 'Custom bags for branding', category: 'marketing', type: 'Shopping Bags', cost: 5000, monthlyCost: 0, impact: { revenue: '+10%', costs: '-5K', risk: 'Very Low', timeline: '2 weeks' } },
    { id: 'pos_retail', title: 'Retail POS System', description: 'Point of sale with inventory', category: 'asset', type: 'POS System', cost: 30000, monthlyCost: 1000, impact: { revenue: '+20%', costs: '-30K', risk: 'Low', timeline: '1 week' } },
    { id: 'warehouse', title: 'Warehouse Space', description: 'Storage for bulk inventory', category: 'asset', type: 'Warehouse', cost: 50000, monthlyCost: 5000, impact: { revenue: '+30%', costs: '-5K/mo', risk: 'Low', timeline: '1 month' } },
    { id: 'renovation', title: 'Store Renovation', description: 'Modernize the store look', category: 'upgrade', type: 'Store Renovation', cost: 80000, monthlyCost: 0, impact: { revenue: '+35%', costs: '-80K', risk: 'Medium', timeline: '2 months' } },
    { id: 'digital_ads', title: 'Digital Marketing', description: 'Google/Facebook ads', category: 'marketing', type: 'Digital Ads', cost: 0, monthlyCost: 10000, impact: { revenue: '+40%', costs: '-10K/mo', risk: 'Low', timeline: '2 weeks' } },
    { id: 'loyalty_program', title: 'Customer Loyalty Program', description: 'Rewards program for repeat customers', category: 'strategy', type: 'Loyalty Program', cost: 10000, monthlyCost: 2000, impact: { revenue: '+25%', costs: '-2K/mo', risk: 'Low', timeline: '1 month' } },
  ],
  tech: [
    { id: 'office_setup', title: 'Office Setup', description: 'Complete tech office setup', category: 'asset', type: 'Office Setup', cost: 150000, monthlyCost: 0, impact: { revenue: '+30%', costs: '-1.5L', risk: 'Low', timeline: '1 month' } },
    { id: 'computers', title: 'Developer Computers', description: 'High-performance workstations', category: 'asset', type: 'Computers', cost: 80000, monthlyCost: 0, impact: { revenue: '+25%', costs: '-80K', risk: 'Low', timeline: '1 week' } },
    { id: 'cloud', title: 'Cloud Hosting', description: 'AWS/Google Cloud setup', category: 'service', type: 'Cloud Hosting', cost: 20000, monthlyCost: 15000, impact: { revenue: '+20%', costs: '-15K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'senior_dev', title: 'Hire Senior Developer', description: 'Experienced tech lead', category: 'staff', type: 'Senior Developer', cost: 0, monthlyCost: 80000, impact: { revenue: '+40%', costs: '-80K/mo', risk: 'Medium', timeline: '2 weeks' } },
    { id: 'junior_dev', title: 'Hire Junior Developer', description: 'Entry-level developer', category: 'staff', type: 'Junior Developer', cost: 0, monthlyCost: 40000, impact: { revenue: '+20%', costs: '-40K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'designer', title: 'Hire UI/UX Designer', description: 'Product designer for better UX', category: 'staff', type: 'UI/UX Designer', cost: 0, monthlyCost: 50000, impact: { revenue: '+25%', costs: '-50K/mo', risk: 'Low', timeline: '1 week' } },
    { id: 'manager', title: 'Hire Office Manager', description: 'Administrative support', category: 'staff', type: 'Office Manager', cost: 0, monthlyCost: 35000, impact: { revenue: '+10%', costs: '-35K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'certification', title: 'Security Certification', description: 'ISO 27001, SOC2 compliance', category: 'compliance', type: 'Security Certification', cost: 80000, monthlyCost: 0, impact: { revenue: '+35%', costs: '-80K', risk: 'Medium', timeline: '3 months' } },
    { id: 'marketing', title: 'Marketing Campaign', description: 'Product launch marketing', category: 'marketing', type: 'Marketing Campaign', cost: 50000, monthlyCost: 0, impact: { revenue: '+50%', costs: '-50K', risk: 'Medium', timeline: '1 month' } },
    { id: 'saas', title: 'Launch SaaS Product', description: 'New subscription product', category: 'growth', type: 'SaaS Launch', cost: 100000, monthlyCost: 20000, impact: { revenue: '+80%', costs: '-1L', risk: 'High', timeline: '3 months' } },
    { id: 'mobile_app', title: 'Mobile App Development', description: 'iOS/Android app', category: 'growth', type: 'Mobile App', cost: 150000, monthlyCost: 0, impact: { revenue: '+60%', costs: '-1.5L', risk: 'High', timeline: '4 months' } },
    { id: 'ai_features', title: 'AI Feature Integration', description: 'Add AI capabilities', category: 'upgrade', type: 'AI Integration', cost: 100000, monthlyCost: 25000, impact: { revenue: '+70%', costs: '-1L', risk: 'High', timeline: '2 months' } },
  ],
  salon: [
    { id: 'salon_chairs', title: 'Salon Chairs (x4)', description: 'Styling stations setup', category: 'asset', type: 'Salon Chairs', cost: 80000, monthlyCost: 0, impact: { revenue: '+20%', costs: '-80K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'mirror_stations', title: 'Mirror Stations', description: 'Professional styling mirrors', category: 'asset', type: 'Mirror Stations', cost: 20000, monthlyCost: 0, impact: { revenue: '+10%', costs: '-20K', risk: 'Very Low', timeline: '1 week' } },
    { id: 'wash_station', title: 'Washing Station', description: 'Hair wash area setup', category: 'asset', type: 'Washing Station', cost: 25000, monthlyCost: 0, impact: { revenue: '+15%', costs: '-25K', risk: 'Low', timeline: '1 week' } },
    { id: 'hairstylist', title: 'Hire Hairstylist', description: 'Expert hair stylist', category: 'staff', type: 'Hairstylist', cost: 0, monthlyCost: 35000, impact: { revenue: '+30%', costs: '-35K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'assistant', title: 'Hire Assistants (x2)', description: 'Washing and cleanup staff', category: 'staff', type: 'Assistant', cost: 0, monthlyCost: 20000, impact: { revenue: '+20%', costs: '-20K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'receptionist', title: 'Hire Receptionist', description: 'Front desk staff', category: 'staff', type: 'Receptionist', cost: 0, monthlyCost: 18000, impact: { revenue: '+15%', costs: '-18K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'premium_products', title: 'Premium Hair Products', description: 'Luxury product line', category: 'inventory', type: 'Premium Products', cost: 30000, monthlyCost: 0, impact: { revenue: '+25%', costs: '-30K', risk: 'Low', timeline: 'Immediate' } },
    { id: 'ac_install', title: 'AC Installation', description: 'Air conditioning for comfort', category: 'asset', type: 'AC Installation', cost: 40000, monthlyCost: 2000, impact: { revenue: '+15%', costs: '-2K/mo', risk: 'Very Low', timeline: '1 week' } },
    { id: 'social_salon', title: 'Social Media Marketing', description: 'Instagram/Google ads', category: 'marketing', type: 'Social Media Marketing', cost: 0, monthlyCost: 8000, impact: { revenue: '+40%', costs: '-8K/mo', risk: 'Low', timeline: '2 weeks' } },
    { id: 'bridal_package', title: 'Bridal Package', description: 'Wedding makeup services', category: 'growth', type: 'Bridal Package', cost: 25000, monthlyCost: 0, impact: { revenue: '+50%', costs: '-25K', risk: 'Medium', timeline: '1 month' } },
    { id: 'membership', title: 'Membership Program', description: 'Monthly subscription service', category: 'strategy', type: 'Membership Program', cost: 5000, monthlyCost: 0, impact: { revenue: '+35%', costs: '-5K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'franchise', title: 'Franchise Expansion', description: 'Open second location', category: 'growth', type: 'Franchise', cost: 200000, monthlyCost: 0, impact: { revenue: '+80%', costs: '-2L', risk: 'High', timeline: '4 months' } },
  ],
  tuition: [
    { id: 'classroom', title: 'Classroom Setup', description: 'Furniture and setup for classes', category: 'asset', type: 'Classroom Setup', cost: 50000, monthlyCost: 0, impact: { revenue: '+25%', costs: '-50K', risk: 'Low', timeline: '1 week' } },
    { id: 'computers_lab', title: 'Computer Lab', description: 'Computers for students', category: 'asset', type: 'Computers', cost: 80000, monthlyCost: 0, impact: { revenue: '+30%', costs: '-80K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'whiteboards', title: 'Smart Whiteboards', description: 'Interactive teaching boards', category: 'asset', type: 'Whiteboards', cost: 20000, monthlyCost: 0, impact: { revenue: '+15%', costs: '-20K', risk: 'Very Low', timeline: '1 week' } },
    { id: 'teacher', title: 'Hire Subject Teacher', description: 'Expert subject teacher', category: 'staff', type: 'Teaching Staff', cost: 0, monthlyCost: 40000, impact: { revenue: '+35%', costs: '-40K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'teaching_asst', title: 'Hire Teaching Assistant', description: 'Student doubt clearing', category: 'staff', type: 'Teaching Assistant', cost: 0, monthlyCost: 18000, impact: { revenue: '+20%', costs: '-18K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'digital_materials', title: 'Digital Marketing', description: 'Online ads for enrollment', category: 'marketing', type: 'Digital Marketing', cost: 0, monthlyCost: 8000, impact: { revenue: '+40%', costs: '-8K/mo', risk: 'Low', timeline: '2 weeks' } },
    { id: 'online_platform', title: 'Online Learning Platform', description: 'Video courses portal', category: 'growth', type: 'Online Platform', cost: 50000, monthlyCost: 5000, impact: { revenue: '+60%', costs: '-50K', risk: 'Medium', timeline: '2 months' } },
    { id: 'study_material', title: 'Study Materials', description: 'Books and guides', category: 'inventory', type: 'Study Materials', cost: 15000, monthlyCost: 0, impact: { revenue: '+15%', costs: '-15K', risk: 'Very Low', timeline: 'Immediate' } },
    { id: 'test_series', title: 'Test Series', description: 'Practice tests for students', category: 'service', type: 'Test Series', cost: 10000, monthlyCost: 2000, impact: { revenue: '+25%', costs: '-2K/mo', risk: 'Low', timeline: '2 weeks' } },
    { id: 'certification', title: 'Board Affiliation', description: 'Official board recognition', category: 'compliance', type: 'Board Affiliation', cost: 30000, monthlyCost: 0, impact: { revenue: '+40%', costs: '-30K', risk: 'Medium', timeline: '1 month' } },
    { id: 'competitive_exams', title: 'Competitive Exam Coaching', description: 'IIT/JEE/NEET coaching', category: 'growth', type: 'Competitive Coaching', cost: 100000, monthlyCost: 0, impact: { revenue: '+70%', costs: '-1L', risk: 'High', timeline: '3 months' } },
    { id: 'franchise_tuition', title: 'Franchise Branch', description: 'Open branch in another area', category: 'growth', type: 'Franchise', cost: 150000, monthlyCost: 0, impact: { revenue: '+80%', costs: '-1.5L', risk: 'High', timeline: '4 months' } },
  ],
  grocery: [
    { id: 'shop_setup', title: 'Shop Setup', description: 'Complete grocery store setup', category: 'asset', type: 'Shop Setup', cost: 60000, monthlyCost: 0, impact: { revenue: '+25%', costs: '-60K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'refrigeration', title: 'Refrigeration Units', description: 'Cold storage for perishables', category: 'asset', type: 'Refrigeration', cost: 50000, monthlyCost: 2000, impact: { revenue: '+30%', costs: '-50K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'shelving_grocery', title: 'Display Shelving', description: 'Organized product display', category: 'asset', type: 'Shelving', cost: 25000, monthlyCost: 0, impact: { revenue: '+20%', costs: '-25K', risk: 'Very Low', timeline: '1 week' } },
    { id: 'billing_system', title: 'Digital Billing System', description: 'POS with barcode scanner', category: 'asset', type: 'Billing System', cost: 20000, monthlyCost: 500, impact: { revenue: '+15%', costs: '-20K', risk: 'Low', timeline: '1 week' } },
    { id: 'delivery_boy', title: 'Hire Delivery Boy', description: 'Home delivery service', category: 'staff', type: 'Delivery Boy', cost: 0, monthlyCost: 15000, impact: { revenue: '+40%', costs: '-15K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'counter_staff', title: 'Hire Counter Staff (x2)', description: 'Billing and customer service', category: 'staff', type: 'Counter Staff', cost: 0, monthlyCost: 24000, impact: { revenue: '+20%', costs: '-24K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'stock_management', title: 'Stock Management System', description: 'Inventory tracking software', category: 'service', type: 'Stock Software', cost: 15000, monthlyCost: 1000, impact: { revenue: '+15%', costs: '-15K', risk: 'Low', timeline: '1 week' } },
    { id: 'branding', title: 'Store Branding', description: 'Signage and branding', category: 'marketing', type: 'Branding', cost: 15000, monthlyCost: 0, impact: { revenue: '+25%', costs: '-15K', risk: 'Very Low', timeline: '2 weeks' } },
    { id: 'online_ordering', title: 'Quick Commerce App', description: 'Partner with delivery apps', category: 'service', type: 'Quick Commerce', cost: 10000, monthlyCost: 5000, impact: { revenue: '+60%', costs: '-10K', risk: 'Medium', timeline: '2 weeks' } },
    { id: 'wholesale_link', title: 'Wholesale Connection', description: 'Direct farmer connection', category: 'strategy', type: 'Wholesale Link', cost: 5000, monthlyCost: 0, impact: { revenue: '+30%', costs: '-5K', risk: 'Low', timeline: '1 week' } },
    { id: 'premium_section', title: 'Premium Products Section', description: 'Organic and imported goods', category: 'inventory', type: 'Premium Section', cost: 30000, monthlyCost: 0, impact: { revenue: '+35%', costs: '-30K', risk: 'Medium', timeline: '2 weeks' } },
    { id: 'store_expansion', title: 'Second Store', description: 'Open another location', category: 'growth', type: 'Expansion', cost: 100000, monthlyCost: 0, impact: { revenue: '+80%', costs: '-1L', risk: 'High', timeline: '2 months' } },
  ],
  fitness: [
    { id: 'gym_equipment', title: 'Gym Equipment', description: 'Treadmills, weights, machines', category: 'asset', type: 'Gym Equipment', cost: 100000, monthlyCost: 0, impact: { revenue: '+30%', costs: '-1L', risk: 'Low', timeline: '1 month' } },
    { id: 'ac_fitness', title: 'AC Installation', description: 'Air conditioning for comfort', category: 'asset', type: 'AC Installation', cost: 50000, monthlyCost: 3000, impact: { revenue: '+25%', costs: '-50K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'mirrors_fitness', title: 'Exercise Mirrors', description: 'Wall mirrors for form checking', category: 'asset', type: 'Mirrors', cost: 10000, monthlyCost: 0, impact: { revenue: '+10%', costs: '-10K', risk: 'Very Low', timeline: '1 week' } },
    { id: 'yoga_mats', title: 'Yoga Mats & Accessories', description: 'Mats, blocks, straps', category: 'inventory', type: 'Yoga Mats', cost: 15000, monthlyCost: 0, impact: { revenue: '+15%', costs: '-15K', risk: 'Low', timeline: 'Immediate' } },
    { id: 'personal_trainer', title: 'Hire Personal Trainer', description: 'Certified fitness trainer', category: 'staff', type: 'Personal Trainer', cost: 0, monthlyCost: 45000, impact: { revenue: '+40%', costs: '-45K/mo', risk: 'Medium', timeline: 'Immediate' } },
    { id: 'receptionist_fitness', title: 'Hire Receptionist', description: 'Front desk staff', category: 'staff', type: 'Receptionist', cost: 0, monthlyCost: 18000, impact: { revenue: '+15%', costs: '-18K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'dietitian', title: 'Hire Dietitian', description: 'Nutrition consultation service', category: 'staff', type: 'Dietitian', cost: 0, monthlyCost: 35000, impact: { revenue: '+30%', costs: '-35K/mo', risk: 'Medium', timeline: '1 week' } },
    { id: 'online_training', title: 'Online Training Platform', description: 'Video workout sessions', category: 'service', type: 'Online Platform', cost: 30000, monthlyCost: 3000, impact: { revenue: '+50%', costs: '-30K', risk: 'Medium', timeline: '2 weeks' } },
    { id: 'digital_marketing_fitness', title: 'Social Media Marketing', description: 'Instagram/Facebook ads', category: 'marketing', type: 'Social Media', cost: 0, monthlyCost: 10000, impact: { revenue: '+45%', costs: '-10K/mo', risk: 'Low', timeline: '2 weeks' } },
    { id: 'membership_app', title: 'Fitness App', description: 'Member tracking app', category: 'service', type: 'Mobile App', cost: 25000, monthlyCost: 1000, impact: { revenue: '+35%', costs: '-25K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'group_classes', title: 'Group Fitness Classes', description: 'Zumba, aerobics, HIIT', category: 'service', type: 'Group Classes', cost: 15000, monthlyCost: 5000, impact: { revenue: '+40%', costs: '-15K', risk: 'Low', timeline: '1 week' } },
    { id: 'franchise_fitness', title: 'Gym Franchise', description: 'Open second location', category: 'growth', type: 'Franchise', cost: 200000, monthlyCost: 0, impact: { revenue: '+90%', costs: '-2L', risk: 'High', timeline: '3 months' } },
  ],
  service: [
    { id: 'office_service', title: 'Office Setup', description: 'Professional workspace setup', category: 'asset', type: 'Office Setup', cost: 40000, monthlyCost: 0, impact: { revenue: '+25%', costs: '-40K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'laptop_staff', title: 'Work Laptop', description: 'Professional work laptop', category: 'asset', type: 'Laptop', cost: 50000, monthlyCost: 0, impact: { revenue: '+20%', costs: '-50K', risk: 'Low', timeline: '1 week' } },
    { id: 'website', title: 'Professional Website', description: 'Portfolio and service showcase', category: 'asset', type: 'Website', cost: 25000, monthlyCost: 500, impact: { revenue: '+40%', costs: '-25K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'consultant_hire', title: 'Hire Consultant', description: 'Domain expert consultant', category: 'staff', type: 'Consultant', cost: 0, monthlyCost: 60000, impact: { revenue: '+50%', costs: '-60K/mo', risk: 'Medium', timeline: 'Immediate' } },
    { id: 'assistant_service', title: 'Hire Assistant', description: 'Admin support staff', category: 'staff', type: 'Assistant', cost: 0, monthlyCost: 20000, impact: { revenue: '+25%', costs: '-20K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'designer_service', title: 'Hire Designer', description: 'Graphics and presentation', category: 'staff', type: 'Designer', cost: 0, monthlyCost: 35000, impact: { revenue: '+30%', costs: '-35K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'crm_software', title: 'CRM Software', description: 'Customer relationship management', category: 'service', type: 'CRM Software', cost: 15000, monthlyCost: 2000, impact: { revenue: '+35%', costs: '-15K', risk: 'Low', timeline: '1 week' } },
    { id: 'google_ads', title: 'Google Ads Campaign', description: 'Online service advertising', category: 'marketing', type: 'Google Ads', cost: 0, monthlyCost: 15000, impact: { revenue: '+50%', costs: '-15K/mo', risk: 'Medium', timeline: '1 week' } },
    { id: 'linkedin_marketing', title: 'LinkedIn Marketing', description: 'B2B professional network', category: 'marketing', type: 'LinkedIn', cost: 0, monthlyCost: 8000, impact: { revenue: '+40%', costs: '-8K/mo', risk: 'Low', timeline: '2 weeks' } },
    { id: 'certification_service', title: 'Industry Certification', description: 'Professional credentials', category: 'compliance', type: 'Certification', cost: 30000, monthlyCost: 0, impact: { revenue: '+45%', costs: '-30K', risk: 'Medium', timeline: '1 month' } },
    { id: 'saas_product', title: 'SaaS Product Launch', description: 'Launch subscription service', category: 'growth', type: 'SaaS Launch', cost: 80000, monthlyCost: 15000, impact: { revenue: '+80%', costs: '-80K', risk: 'High', timeline: '3 months' } },
    { id: 'team_expansion', title: 'Team Expansion', description: 'Hire 3 more specialists', category: 'growth', type: 'Team Expansion', cost: 0, monthlyCost: 120000, impact: { revenue: '+100%', costs: '-1.2L/mo', risk: 'High', timeline: '1 month' } },
  ],
  premium_grocery: [
    { id: 'premium_store_setup', title: 'Premium Store Setup', description: 'Upscale boutique grocery setup', category: 'asset', type: 'Premium Setup', cost: 100000, monthlyCost: 0, impact: { revenue: '+30%', costs: '-1L', risk: 'Medium', timeline: '1 month' } },
    { id: 'cold_storage_premium', title: 'Cold Storage Unit', description: 'Walk-in cooler for fresh produce', category: 'asset', type: 'Cold Storage', cost: 80000, monthlyCost: 4000, impact: { revenue: '+25%', costs: '-80K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'premium_shelving', title: 'Designer Shelving', description: 'Wooden and glass displays', category: 'asset', type: 'Premium Shelving', cost: 50000, monthlyCost: 0, impact: { revenue: '+20%', costs: '-50K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'lighting', title: 'Ambient Lighting', description: 'Premium store lighting', category: 'asset', type: 'Lighting', cost: 20000, monthlyCost: 0, impact: { revenue: '+15%', costs: '-20K', risk: 'Very Low', timeline: '1 week' } },
    { id: 'organic_section', title: 'Organic Products Section', description: 'Organic fruits, vegetables, grains', category: 'inventory', type: 'Organic Section', cost: 60000, monthlyCost: 0, impact: { revenue: '+45%', costs: '-60K', risk: 'Medium', timeline: '2 weeks' } },
    { id: 'imported_section', title: 'Imported Goods Section', description: 'International premium products', category: 'inventory', type: 'Imported Section', cost: 80000, monthlyCost: 0, impact: { revenue: '+50%', costs: '-80K', risk: 'Medium', timeline: '3 weeks' } },
    { id: 'delivery_service_premium', title: 'Premium Delivery Service', description: 'Same-day premium delivery', category: 'service', type: 'Premium Delivery', cost: 20000, monthlyCost: 8000, impact: { revenue: '+40%', costs: '-20K', risk: 'Low', timeline: '1 week' } },
    { id: 'loyalty_app', title: 'Premium Loyalty App', description: 'Member app with rewards', category: 'service', type: 'Loyalty App', cost: 30000, monthlyCost: 2000, impact: { revenue: '+35%', costs: '-30K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'tasting_events', title: 'Food Tasting Events', description: 'Weekly product sampling', category: 'marketing', type: 'Tasting Events', cost: 15000, monthlyCost: 5000, impact: { revenue: '+30%', costs: '-15K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'store_branding', title: 'Luxury Branding', description: 'Premium packaging and bags', category: 'marketing', type: 'Luxury Branding', cost: 25000, monthlyCost: 0, impact: { revenue: '+25%', costs: '-25K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'wine_section', title: 'Wine & Spirits Section', description: 'Premium alcohol selection', category: 'inventory', type: 'Wine Section', cost: 100000, monthlyCost: 0, impact: { revenue: '+60%', costs: '-1L', risk: 'High', timeline: '1 month' } },
    { id: 'franchise_premium', title: 'Second Premium Store', description: 'Expand to another area', category: 'growth', type: 'Franchise', cost: 200000, monthlyCost: 0, impact: { revenue: '+80%', costs: '-2L', risk: 'High', timeline: '3 months' } },
  ],
  food_stall: [
    { id: 'stall_setup', title: 'Food Stall Setup', description: 'Stall with basic infrastructure', category: 'asset', type: 'Stall Setup', cost: 40000, monthlyCost: 0, impact: { revenue: '+30%', costs: '-40K', risk: 'Low', timeline: '1 week' } },
    { id: 'cooking_equipment', title: 'Cooking Equipment', description: 'Tawa, burner, containers', category: 'asset', type: 'Cooking Equip', cost: 20000, monthlyCost: 0, impact: { revenue: '+25%', costs: '-20K', risk: 'Low', timeline: '1 week' } },
    { id: 'food_processor', title: 'Food Processor', description: 'Mixer and grinder', category: 'asset', type: 'Food Processor', cost: 8000, monthlyCost: 0, impact: { revenue: '+15%', costs: '-8K', risk: 'Very Low', timeline: 'Immediate' } },
    { id: 'vendor_helper', title: 'Hire Helper', description: 'Cooking and serving assistance', category: 'staff', type: 'Helper', cost: 0, monthlyCost: 12000, impact: { revenue: '+30%', costs: '-12K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'delivery_partnership', title: 'Delivery Partnership', description: 'Zomato/Swiggy partnership', category: 'service', type: 'Delivery', cost: 5000, monthlyCost: 3000, impact: { revenue: '+50%', costs: '-5K', risk: 'Low', timeline: '1 week' } },
    { id: 'packaging', title: 'Premium Packaging', description: 'Branded food containers', category: 'inventory', type: 'Packaging', cost: 5000, monthlyCost: 0, impact: { revenue: '+20%', costs: '-5K', risk: 'Very Low', timeline: 'Immediate' } },
    { id: 'social_media_food', title: 'Social Media Presence', description: 'Instagram/Facebook page', category: 'marketing', type: 'Social Media', cost: 0, monthlyCost: 3000, impact: { revenue: '+40%', costs: '-3K/mo', risk: 'Low', timeline: '1 week' } },
    { id: 'license_food', title: 'Food Stall License', description: 'Municipal food license', category: 'compliance', type: 'Food License', cost: 3000, monthlyCost: 0, impact: { revenue: '+15%', costs: '-3K', risk: 'Very Low', timeline: '2 weeks' } },
    { id: 'specialty_item', title: 'Specialty Dish', description: 'Unique recipe development', category: 'strategy', type: 'Specialty Dish', cost: 10000, monthlyCost: 0, impact: { revenue: '+45%', costs: '-10K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'franchise_stall', title: 'Multiple Stall Locations', description: 'Open stalls at multiple spots', category: 'growth', type: 'Multi Location', cost: 80000, monthlyCost: 0, impact: { revenue: '+100%', costs: '-80K', risk: 'Medium', timeline: '2 months' } },
  ],
  mobile_repair: [
    { id: 'repair_workshop', title: 'Repair Workshop Setup', description: 'Workbench and tools setup', category: 'asset', type: 'Workshop', cost: 30000, monthlyCost: 0, impact: { revenue: '+25%', costs: '-30K', risk: 'Low', timeline: '1 week' } },
    { id: 'repair_tools', title: 'Repair Tools Kit', description: 'Screwdrivers, heat gun, multimeter', category: 'asset', type: 'Tools Kit', cost: 15000, monthlyCost: 0, impact: { revenue: '+20%', costs: '-15K', risk: 'Low', timeline: '1 week' } },
    { id: 'spare_parts', title: 'Spare Parts Inventory', description: 'Screen, battery, charging port', category: 'inventory', type: 'Spare Parts', cost: 40000, monthlyCost: 0, impact: { revenue: '+35%', costs: '-40K', risk: 'Low', timeline: 'Immediate' } },
    { id: 'technician', title: 'Hire Technician', description: 'Expert phone repair technician', category: 'staff', type: 'Technician', cost: 0, monthlyCost: 25000, impact: { revenue: '+45%', costs: '-25K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'senior_tech', title: 'Hire Senior Technician', description: 'Board-level repair specialist', category: 'staff', type: 'Senior Tech', cost: 0, monthlyCost: 45000, impact: { revenue: '+60%', costs: '-45K/mo', risk: 'Medium', timeline: 'Immediate' } },
    { id: 'counter_staff_mobile', title: 'Hire Counter Staff', description: 'Reception and billing', category: 'staff', type: 'Counter Staff', cost: 0, monthlyCost: 12000, impact: { revenue: '+20%', costs: '-12K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'online_booking', title: 'Online Booking System', description: 'Website/app for appointments', category: 'service', type: 'Booking System', cost: 10000, monthlyCost: 500, impact: { revenue: '+40%', costs: '-10K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'google_mybusiness', title: 'Google My Business', description: 'Local SEO optimization', category: 'marketing', type: 'Local SEO', cost: 0, monthlyCost: 2000, impact: { revenue: '+35%', costs: '-2K/mo', risk: 'Low', timeline: '1 week' } },
    { id: 'warranty_service', title: 'Warranty Service', description: 'Official service center status', category: 'compliance', type: 'Warranty Center', cost: 20000, monthlyCost: 0, impact: { revenue: '+50%', costs: '-20K', risk: 'Medium', timeline: '1 month' } },
    { id: 'multiple_brands', title: 'Multi-Brand Service', description: 'Apple, Samsung, OnePlus authorized', category: 'strategy', type: 'Multi-Brand', cost: 25000, monthlyCost: 0, impact: { revenue: '+60%', costs: '-25K', risk: 'Medium', timeline: '2 weeks' } },
    { id: 'pickup_delivery', title: 'Pickup & Delivery', description: 'Home service option', category: 'service', type: 'Pickup Delivery', cost: 5000, monthlyCost: 3000, impact: { revenue: '+30%', costs: '-5K', risk: 'Low', timeline: '1 week' } },
    { id: 'branch_expansion', title: 'Second Workshop', description: 'Open another location', category: 'growth', type: 'Branch', cost: 50000, monthlyCost: 0, impact: { revenue: '+80%', costs: '-50K', risk: 'Medium', timeline: '2 months' } },
  ],
  pharmacy: [
    { id: 'pharmacy_setup', title: 'Pharmacy Setup', description: 'Complete pharmacy infrastructure', category: 'asset', type: 'Pharmacy Setup', cost: 80000, monthlyCost: 0, impact: { revenue: '+30%', costs: '-80K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'refrigeration_pharma', title: 'Medicine Refrigerator', description: 'Temperature controlled storage', category: 'asset', type: 'Medicine Fridge', cost: 30000, monthlyCost: 2000, impact: { revenue: '+25%', costs: '-30K', risk: 'Low', timeline: '1 week' } },
    { id: 'shelving_pharma', title: 'Medicine Shelving', description: 'Organized medicine display', category: 'asset', type: 'Shelving', cost: 20000, monthlyCost: 0, impact: { revenue: '+15%', costs: '-20K', risk: 'Low', timeline: '1 week' } },
    { id: 'billing_pharma', title: 'Pharmacy Billing System', description: 'Medical billing software', category: 'asset', type: 'Billing System', cost: 15000, monthlyCost: 500, impact: { revenue: '+20%', costs: '-15K', risk: 'Low', timeline: '1 week' } },
    { id: 'pharmacist', title: 'Hire Pharmacist', description: 'Registered pharmacist', category: 'staff', type: 'Pharmacist', cost: 0, monthlyCost: 35000, impact: { revenue: '+40%', costs: '-35K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'assistant_pharma', title: 'Hire Assistant', description: 'Stock and customer support', category: 'staff', type: 'Assistant', cost: 0, monthlyCost: 15000, impact: { revenue: '+25%', costs: '-15K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'delivery_pharma', title: 'Medicine Delivery', description: 'Home delivery service', category: 'service', type: 'Delivery', cost: 10000, monthlyCost: 3000, impact: { revenue: '+45%', costs: '-10K', risk: 'Low', timeline: '1 week' } },
    { id: 'franchise_pharma', title: 'Pharmacy Franchise', description: 'Apollo/Medplus franchise', category: 'growth', type: 'Franchise', cost: 150000, monthlyCost: 0, impact: { revenue: '+70%', costs: '-1.5L', risk: 'Medium', timeline: '2 months' } },
    { id: 'insurance_claim', title: 'Insurance Claim Center', description: 'Tie up with insurance companies', category: 'service', type: 'Insurance', cost: 10000, monthlyCost: 0, impact: { revenue: '+50%', costs: '-10K', risk: 'Medium', timeline: '2 weeks' } },
    { id: 'otc_products', title: 'OTC Products Section', description: 'Vitamins, supplements, cosmetics', category: 'inventory', type: 'OTC Section', cost: 20000, monthlyCost: 0, impact: { revenue: '+30%', costs: '-20K', risk: 'Low', timeline: '1 week' } },
    { id: 'local_seo_pharma', title: 'Local SEO Marketing', description: 'Google business listing', category: 'marketing', type: 'Local SEO', cost: 0, monthlyCost: 3000, impact: { revenue: '+35%', costs: '-3K/mo', risk: 'Low', timeline: '1 week' } },
    { id: 'clinic_tieup', title: 'Doctor Clinic Tie-up', description: 'Prescription partnership', category: 'strategy', type: 'Clinic Tie-up', cost: 5000, monthlyCost: 0, impact: { revenue: '+40%', costs: '-5K', risk: 'Low', timeline: '2 weeks' } },
  ],
  laundry: [
    { id: 'laundry_setup', title: 'Laundry Setup', description: 'Washing machines and dryers', category: 'asset', type: 'Laundry Setup', cost: 80000, monthlyCost: 0, impact: { revenue: '+30%', costs: '-80K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'industrial_washer', title: 'Industrial Washing Machine', description: 'Heavy duty commercial washer', category: 'asset', type: 'Industrial Washer', cost: 60000, monthlyCost: 0, impact: { revenue: '+35%', costs: '-60K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'dryer_machine', title: 'Commercial Dryer', description: 'Industrial tumble dryer', category: 'asset', type: 'Dryer', cost: 40000, monthlyCost: 0, impact: { revenue: '+25%', costs: '-40K', risk: 'Low', timeline: '2 weeks' } },
    { id: 'ironing_equipment', title: 'Ironing Station', description: 'Steam iron and tables', category: 'asset', type: 'Ironing Station', cost: 15000, monthlyCost: 0, impact: { revenue: '+15%', costs: '-15K', risk: 'Low', timeline: '1 week' } },
    { id: 'laundry_staff', title: 'Hire Laundry Staff', description: 'Washing and folding workers', category: 'staff', type: 'Laundry Staff', cost: 0, monthlyCost: 18000, impact: { revenue: '+30%', costs: '-18K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'delivery_laundry', title: 'Hire Delivery Person', description: 'Pickup and delivery service', category: 'staff', type: 'Delivery Person', cost: 0, monthlyCost: 15000, impact: { revenue: '+40%', costs: '-15K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'water_heater', title: 'Water Heater System', description: 'Hot water for washing', category: 'asset', type: 'Water Heater', cost: 20000, monthlyCost: 2000, impact: { revenue: '+20%', costs: '-20K', risk: 'Low', timeline: '1 week' } },
    { id: 'detergent_supply', title: 'Premium Detergent Supply', description: 'Quality fabric care products', category: 'inventory', type: 'Detergent', cost: 10000, monthlyCost: 0, impact: { revenue: '+25%', costs: '-10K', risk: 'Low', timeline: 'Immediate' } },
    { id: 'hangers_pack', title: 'Hangers and Packaging', description: 'Garment bags and hangers', category: 'inventory', type: 'Packaging', cost: 5000, monthlyCost: 0, impact: { revenue: '+10%', costs: '-5K', risk: 'Very Low', timeline: 'Immediate' } },
    { id: 'app_laundry', title: 'Laundry App', description: 'Online booking and tracking', category: 'service', type: 'Mobile App', cost: 20000, monthlyCost: 1000, impact: { revenue: '+50%', costs: '-20K', risk: 'Medium', timeline: '2 weeks' } },
    { id: 'digital_marketing_laundry', title: 'Social Media Marketing', description: 'Local area promotion', category: 'marketing', type: 'Social Media', cost: 0, monthlyCost: 5000, impact: { revenue: '+35%', costs: '-5K/mo', risk: 'Low', timeline: '2 weeks' } },
    { id: 'corporate_tieup', title: 'Corporate Tie-ups', description: 'Hotels and corporate clients', category: 'strategy', type: 'Corporate Tie-up', cost: 10000, monthlyCost: 0, impact: { revenue: '+60%', costs: '-10K', risk: 'Medium', timeline: '1 month' } },
  ],
  manufacturing: [
    { id: 'factory_space', title: 'Factory Space', description: 'Manufacturing unit setup', category: 'asset', type: 'Factory Space', cost: 200000, monthlyCost: 0, impact: { revenue: '+40%', costs: '-2L', risk: 'Medium', timeline: '2 months' } },
    { id: 'machinery', title: 'Industrial Machinery', description: 'Production equipment', category: 'asset', type: 'Machinery', cost: 300000, monthlyCost: 0, impact: { revenue: '+50%', costs: '-3L', risk: 'Medium', timeline: '3 months' } },
    { id: 'raw_materials', title: 'Buy Raw Materials', description: 'Input materials for production', category: 'inventory', type: 'Raw Materials', cost: 80000, monthlyCost: 0, impact: { revenue: '+30%', costs: '-80K', risk: 'Low', timeline: 'Immediate' } },
    { id: 'workers', title: 'Hire Workers', description: 'Production line staff', category: 'staff', type: 'Workers', cost: 0, monthlyCost: 60000, impact: { revenue: '+35%', costs: '-60K/mo', risk: 'Low', timeline: 'Immediate' } },
    { id: 'quality_inspector', title: 'Hire Quality Inspector', description: 'Quality control staff', category: 'staff', type: 'Quality Inspector', cost: 0, monthlyCost: 35000, impact: { revenue: '+15%', costs: '-35K/mo', risk: 'Low', timeline: '1 week' } },
    { id: 'delivery_vehicle', title: 'Delivery Vehicle', description: 'Own delivery truck', category: 'asset', type: 'Delivery Vehicle', cost: 80000, monthlyCost: 5000, impact: { revenue: '+25%', costs: '-5K/mo', risk: 'Low', timeline: '2 weeks' } },
    { id: 'warehouse_mfg', title: 'Warehouse Space', description: 'Finished goods storage', category: 'asset', type: 'Warehouse', cost: 50000, monthlyCost: 5000, impact: { revenue: '+15%', costs: '-5K/mo', risk: 'Low', timeline: '1 month' } },
    { id: 'bulk_discount', title: 'Bulk Order Discount', description: 'Better rates on materials', category: 'strategy', type: 'Bulk Order Discount', cost: 10000, monthlyCost: 0, impact: { revenue: '+20%', costs: '-10K', risk: 'Very Low', timeline: 'Immediate' } },
    { id: 'safety_equip', title: 'Safety Equipment', description: 'Safety gear for workers', category: 'compliance', type: 'Safety Equipment', cost: 20000, monthlyCost: 0, impact: { revenue: '+5%', costs: '-20K', risk: 'Very Low', timeline: '1 week' } },
    { id: 'automation', title: 'Automation Upgrade', description: 'Semi-automated production', category: 'upgrade', type: 'Automation', cost: 200000, monthlyCost: 0, impact: { revenue: '+60%', costs: '-2L', risk: 'High', timeline: '4 months' } },
    { id: 'export', title: 'Export License', description: 'Sell internationally', category: 'growth', type: 'Export License', cost: 50000, monthlyCost: 0, impact: { revenue: '+80%', costs: '-50K', risk: 'High', timeline: '3 months' } },
    { id: 'quality_cert', title: 'ISO Certification', description: 'Quality certification', category: 'compliance', type: 'Quality Certification', cost: 40000, monthlyCost: 0, impact: { revenue: '+35%', costs: '-40K', risk: 'Medium', timeline: '2 months' } },
  ],
};

export function getBusinessCards(
  businessType: string,
  cityTier: number,
  phase: string,
  cash: number,
  month: number
): DecisionCard[] {
  const tierMult = TIER_MULTIPLIERS[cityTier] || 1.0;
  const cards = BUSINESS_CARDS[businessType.toLowerCase()] || BUSINESS_CARDS.restaurant;
  
  return cards
    .filter(card => {
      if (card.requirements?.minCash && cash < card.requirements.minCash * tierMult) return false;
      if (card.requirements?.minMonth && month < card.requirements.minMonth) return false;
      return true;
    })
    .map(card => ({
      ...card,
      cost: Math.round(card.cost * tierMult),
      monthlyCost: Math.round(card.monthlyCost * tierMult),
    }));
}

export function getRandomCards(businessType: string, cityTier: number, count: number, phase: string, cash: number, month: number): DecisionCard[] {
  const cards = getBusinessCards(businessType, cityTier, phase, cash, month);
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, cards.length));
}
