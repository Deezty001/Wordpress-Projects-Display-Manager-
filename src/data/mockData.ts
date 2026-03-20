export interface Template {
  id: string;
  title: string;
  website: string;
  category: string;
  imageUrl: string;
  demoUrl: string;
}

export const mockTemplates: Template[] = [
  {
    id: '1',
    title: 'Agency Hero Section',
    website: 'studio-alpha.com',
    category: 'Hero',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=800',
    demoUrl: 'https://bricksbuilder.io/'
  },
  {
    id: '2',
    title: 'SaaS Pricing Table',
    website: 'saas-builder.dev',
    category: 'Pricing',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200&h=800',
    demoUrl: 'https://bricksbuilder.io/'
  },
  {
    id: '3',
    title: 'Minimalist Portfolio Grid',
    website: 'studio-alpha.com',
    category: 'Grid',
    imageUrl: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&q=80&w=1200&h=800',
    demoUrl: 'https://bricksbuilder.io/'
  },
  {
    id: '4',
    title: 'Elegant Contact Form',
    website: 'corporate-wp.com',
    category: 'Forms',
    imageUrl: 'https://images.unsplash.com/photo-1596526131118-2938def29dc3?auto=format&fit=crop&q=80&w=1200&h=800',
    demoUrl: 'https://bricksbuilder.io/'
  },
  {
    id: '5',
    title: 'Feature Showcase Cards',
    website: 'saas-builder.dev',
    category: 'Features',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200&h=800',
    demoUrl: 'https://bricksbuilder.io/'
  },
  {
    id: '6',
    title: 'Testimonial Slider',
    website: 'corporate-wp.com',
    category: 'Testimonials',
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200&h=800',
    demoUrl: 'https://bricksbuilder.io/'
  }
];
