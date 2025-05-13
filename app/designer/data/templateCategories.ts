interface TemplateSubcategory {
  id: string;
  name: string;
  description?: string;
}

interface TemplateCategory {
  id: string;
  icon: string;
  name: string;
  description?: string;
  subcategories: TemplateSubcategory[];
}

export const templateCategories: TemplateCategory[] = [
  {
    id: 'celebrations',
    icon: '🎉',
    name: 'General Celebrations',
    subcategories: [
      { id: 'birthdays', name: 'Birthdays', description: 'The most iconic cake celebration' },
      { id: 'weddings', name: 'Weddings', description: 'Multi-tiered cakes are standard' },
      { id: 'anniversaries', name: 'Anniversaries', description: 'Especially milestone anniversaries' },
      { id: 'retirement', name: 'Retirement Parties' },
      { id: 'graduations', name: 'Graduations' },
      { id: 'baby-showers', name: 'Baby Showers' },
      { id: 'gender-reveal', name: 'Gender Reveal Parties' },
      { id: 'bridal-showers', name: 'Bridal Showers' },
      { id: 'engagement', name: 'Engagement Parties' },
      { id: 'housewarming', name: 'Housewarmings' },
      { id: 'farewell', name: 'Farewell/Going Away Parties' },
      { id: 'welcome-home', name: 'Welcome Home Parties' },
      { id: 'promotion', name: 'Promotion Celebrations' },
      { id: 'reunions', name: 'Reunions', description: 'Family, school, military, etc.' }
    ]
  },
  {
    id: 'holidays',
    icon: '🎄',
    name: 'Major Holidays',
    subcategories: [
      { id: 'new-years', name: 'New Year\'s Eve/Day', description: 'Champagne cakes, celebratory designs' },
      { id: 'valentines', name: 'Valentine\'s Day', description: 'Heart-shaped or romantic-themed cakes' },
      { id: 'st-patricks', name: 'St. Patrick\'s Day', description: 'Green-themed cakes with clovers' },
      { id: 'easter', name: 'Easter', description: 'Bunny, egg, or pastel-themed cakes' },
      { id: 'mothers-day', name: 'Mother\'s Day', description: 'Floral or elegant cakes' },
      { id: 'fathers-day', name: 'Father\'s Day', description: 'Hobby-themed cakes' },
      { id: 'fourth-july', name: 'Fourth of July', description: 'Patriotic red, white & blue cakes' },
      { id: 'halloween', name: 'Halloween', description: 'Spooky or creepy cakes' },
      { id: 'thanksgiving', name: 'Thanksgiving', description: 'Autumn-themed cakes' },
      { id: 'christmas', name: 'Christmas', description: 'Yule log, Santa, tree-shaped cakes' },
      { id: 'hanukkah', name: 'Hanukkah', description: 'Star of David or dreidel-themed cakes' },
      { id: 'diwali', name: 'Diwali', description: 'Colorful and ornate cakes' },
      { id: 'ramadan', name: 'Ramadan/Eid', description: 'Crescent moon or ornate celebration cakes' },
      { id: 'chinese-new-year', name: 'Chinese New Year', description: 'Dragons, lanterns, zodiac animals' }
    ]
  },
  {
    id: 'achievements',
    icon: '🏅',
    name: 'Achievements & Milestones',
    subcategories: [
      { id: 'sports', name: 'Sports Victories', description: 'Team or individual celebration cakes' },
      { id: 'awards', name: 'Award Ceremonies', description: 'Cake with logos, trophies, or titles' },
      { id: 'grand-openings', name: 'Business Grand Openings' },
      { id: 'company-anniversaries', name: 'Company Anniversaries' },
      { id: 'employee-recognition', name: 'Employee Recognition Events' },
      { id: 'book-launches', name: 'Book Launches' },
      { id: 'art-exhibitions', name: 'Art Exhibitions', description: 'Gallery openings' },
      { id: 'theater-premieres', name: 'Theater/Show Premieres', description: 'Or wrap parties' }
    ]
  },
  {
    id: 'religious-cultural',
    icon: '💖',
    name: 'Religious & Cultural Events',
    subcategories: [
      { id: 'baptisms', name: 'Baptisms / Christenings' },
      { id: 'communion', name: 'First Communion' },
      { id: 'confirmation', name: 'Confirmation' },
      { id: 'bar-mitzvah', name: 'Bar/Bat Mitzvahs' },
      { id: 'quinceanera', name: 'Quinceañera' },
      { id: 'sweet-16', name: 'Sweet 16' },
      { id: 'eid', name: 'Eid Celebrations' },
      { id: 'diwali-cultural', name: 'Diwali' },
      { id: 'passover', name: 'Passover', description: 'Non-leavened cakes sometimes used' }
    ]
  },
  {
    id: 'other',
    icon: '🎂',
    name: 'Other Cake-Worthy Occasions',
    subcategories: [
      { id: 'cake-smash', name: 'Cake Smash Photoshoots', description: '1st Birthday' },
      { id: 'pet-birthdays', name: 'Pet Birthdays', description: '"Pupcakes"' },
      { id: 'divorce', name: 'Divorce Parties' },
      { id: 'just-because', name: 'Just Because', description: 'Or "Thinking of You" Cakes' },
      { id: 'welcome-baby', name: 'Welcome Baby / Sip and See' },
      { id: 'themed-parties', name: 'Themed Parties', description: 'Harry Potter, D&D, Superheroes, etc.' },
      { id: 'seasonal', name: 'Seasonal Changes', description: 'e.g., "Hello Spring" cake' }
    ]
  }
]; 