import { PrismaClient, Role, ListingType, PropertyStatus, InteractionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing records in reverse dependency order
  await prisma.userInteraction.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.savedProperty.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 2. Hash common password
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 3. Create Agents
  const agent1 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.agent@realestatehub.com',
      passwordHash,
      role: Role.AGENT,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      name: 'David Martinez',
      email: 'david.agent@realestatehub.com',
      passwordHash,
      role: Role.AGENT,
    },
  });

  // 4. Create Buyers
  const buyer1 = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.buyer@realestatehub.com',
      passwordHash,
      role: Role.BUYER,
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: 'Emily Chen',
      email: 'emily.buyer@realestatehub.com',
      passwordHash,
      role: Role.BUYER,
    },
  });

  console.log('👤 Created 2 agents and 2 buyers.');

  // 5. Seed 36 Realistic Properties across Austin, New York, Seattle, Miami
  const propertyTemplates = [
    // --- Austin, TX ---
    {
      title: 'Modern Barton Hills Sanctuary',
      description: 'Stunning mid-century inspired home nestled under majestic live oaks. Features floor-to-ceiling windows, white oak floors, and a private pool with outdoor kitchen.',
      price: 1250000,
      propertyType: 'HOUSE',
      listingType: ListingType.SALE,
      bedrooms: 4,
      bathrooms: 3.5,
      sqft: 3100,
      city: 'Austin',
      state: 'TX',
      address: '1804 Barton Hills Dr',
      latitude: 30.2523,
      longitude: -97.7781,
      imageUrls: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Sleek Downtown Austin Skyline Loft',
      description: 'Luxury high-rise condo offering panoramic Lady Bird Lake and skyline views. European cabinetry, quartz countertops, and concierge service.',
      price: 3600,
      propertyType: 'CONDO',
      listingType: ListingType.RENT,
      bedrooms: 2,
      bathrooms: 2.0,
      sqft: 1280,
      city: 'Austin',
      state: 'TX',
      address: '360 Nueces St #1904',
      latitude: 30.2672,
      longitude: -97.7431,
      imageUrls: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Charming East Austin Craftsman',
      description: 'Vibrant bungalow walking distance to trendy coffee shops and music venues. Completely remodeled interior with historic character preserved.',
      price: 685000,
      propertyType: 'HOUSE',
      listingType: ListingType.SALE,
      bedrooms: 3,
      bathrooms: 2.0,
      sqft: 1650,
      city: 'Austin',
      state: 'TX',
      address: '1209 E 11th St',
      latitude: 30.2689,
      longitude: -97.7258,
      imageUrls: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Lake Travis Waterfront Villa',
      description: 'Spectacular estate with direct deep-water lake access, private two-slip dock, infinity edge pool, and separate guest casita.',
      price: 2450000,
      propertyType: 'HOUSE',
      listingType: ListingType.SALE,
      bedrooms: 5,
      bathrooms: 5.5,
      sqft: 5200,
      city: 'Austin',
      state: 'TX',
      address: '4308 Comanche Trail',
      latitude: 30.4011,
      longitude: -97.9102,
      imageUrls: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Mueller Green-Energy Townhome',
      description: 'LEED-certified townhome facing park greenway. Solar panels included, EV-ready two-car garage, and steps from farmer market.',
      price: 2850,
      propertyType: 'TOWNHOUSE',
      listingType: ListingType.RENT,
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 1850,
      city: 'Austin',
      state: 'TX',
      address: '4112 Simond Ave',
      latitude: 30.3015,
      longitude: -97.7056,
      imageUrls: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Zilker Park Contemporary Flat',
      description: 'Walk out your door right into Zilker Park. High ceilings, polished concrete floors, and designer lighting throughout.',
      price: 525000,
      propertyType: 'CONDO',
      listingType: ListingType.SALE,
      bedrooms: 1,
      bathrooms: 1.5,
      sqft: 920,
      city: 'Austin',
      state: 'TX',
      address: '2100 Barton Springs Rd',
      latitude: 30.2641,
      longitude: -97.7709,
      imageUrls: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'South Congress Urban Studio',
      description: 'Prime SoCo location, ideal for young professionals or remote workers. In-unit laundry, gym, and rooftop lounge.',
      price: 1950,
      propertyType: 'APARTMENT',
      listingType: ListingType.RENT,
      bedrooms: 1,
      bathrooms: 1.0,
      sqft: 650,
      city: 'Austin',
      state: 'TX',
      address: '1600 S Congress Ave',
      latitude: 30.2486,
      longitude: -97.7501,
      imageUrls: [
        'https://images.unsplash.com/photo-1502005229762-ee1b2da973e3?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Northwest Hills Sprawling Ranch',
      description: 'Single story ranch on oversized half-acre lot. Award-winning school district, mature trees, and remodeled chef kitchen.',
      price: 890000,
      propertyType: 'HOUSE',
      listingType: ListingType.SALE,
      bedrooms: 4,
      bathrooms: 3.0,
      sqft: 2800,
      city: 'Austin',
      state: 'TX',
      address: '6704 Hart Ln',
      latitude: 30.3541,
      longitude: -97.7554,
      imageUrls: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Rainey Street Luxury Penthouse',
      description: 'Top-floor penthouse with private terrace overlooking the lake and city. Sub-Zero appliances, private elevator access.',
      price: 5800,
      propertyType: 'CONDO',
      listingType: ListingType.RENT,
      bedrooms: 3,
      bathrooms: 3.0,
      sqft: 2100,
      city: 'Austin',
      state: 'TX',
      address: '70 Rainey St #3201',
      latitude: 30.2589,
      longitude: -97.7391,
      imageUrls: [
        'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },

    // --- New York, NY ---
    {
      title: 'West Village Historic Brownstone Floor-Through',
      description: 'Sun-drenched classic apartment featuring exposed brick, wood-burning fireplace, and serene tree-lined street views.',
      price: 4800,
      propertyType: 'APARTMENT',
      listingType: ListingType.RENT,
      bedrooms: 2,
      bathrooms: 1.0,
      sqft: 950,
      city: 'New York',
      state: 'NY',
      address: '82 Perry St',
      latitude: 40.7358,
      longitude: -74.0042,
      imageUrls: [
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Tribeca Architectural Masterpiece Loft',
      description: 'Cast-iron building loft boasting 14-foot timber beamed ceilings, Corinthian columns, and museum-grade finishes throughout.',
      price: 3450000,
      propertyType: 'CONDO',
      listingType: ListingType.SALE,
      bedrooms: 3,
      bathrooms: 3.5,
      sqft: 2850,
      city: 'New York',
      state: 'NY',
      address: '140 Franklin St',
      latitude: 40.7193,
      longitude: -74.0089,
      imageUrls: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Upper West Side Pre-War Classic Six',
      description: 'Direct views of Central Park. Formal dining room, herringbone oak floors, butler pantry, and 24-hour white glove doorman.',
      price: 2150000,
      propertyType: 'CONDO',
      listingType: ListingType.SALE,
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 2050,
      city: 'New York',
      state: 'NY',
      address: '275 Central Park West',
      latitude: 40.7865,
      longitude: -73.9688,
      imageUrls: [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Williamsburg Waterfront Duplex',
      description: 'Floor-to-ceiling glass framing the Manhattan skyline. Private 400 sqft terrace, luxury amenities including indoor pool and spa.',
      price: 6500,
      propertyType: 'APARTMENT',
      listingType: ListingType.RENT,
      bedrooms: 2,
      bathrooms: 2.0,
      sqft: 1350,
      city: 'New York',
      state: 'NY',
      address: '184 Kent Ave',
      latitude: 40.7181,
      longitude: -73.9634,
      imageUrls: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'SoHo Cobblestone Luxury Penthouse',
      description: 'Private keyed elevator opens into an oasis of natural light. Wrap-around landscaped terrace with outdoor fireplace.',
      price: 4900000,
      propertyType: 'CONDO',
      listingType: ListingType.SALE,
      bedrooms: 4,
      bathrooms: 4.0,
      sqft: 3400,
      city: 'New York',
      state: 'NY',
      address: '95 Greene St #PH',
      latitude: 40.7241,
      longitude: -74.0001,
      imageUrls: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Brooklyn Heights Garden Duplex',
      description: 'Rare private garden brownstone duplex. Original crown molding, renovated open kitchen, and quick subway access to Wall St.',
      price: 5200,
      propertyType: 'TOWNHOUSE',
      listingType: ListingType.RENT,
      bedrooms: 2,
      bathrooms: 2.0,
      sqft: 1400,
      city: 'New York',
      state: 'NY',
      address: '42 Remsen St',
      latitude: 40.6946,
      longitude: -73.9961,
      imageUrls: [
        'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Chelsea High Line Modern Apartment',
      description: 'Step directly onto the High Line park. Miele kitchen suite, floor-to-ceiling soundproof windows, and fitness center.',
      price: 3900,
      propertyType: 'APARTMENT',
      listingType: ListingType.RENT,
      bedrooms: 1,
      bathrooms: 1.0,
      sqft: 720,
      city: 'New York',
      state: 'NY',
      address: '520 W 28th St',
      latitude: 40.7517,
      longitude: -74.0028,
      imageUrls: [
        'https://images.unsplash.com/photo-1502005229762-ee1b2da973e3?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Greenwich Village Historic Townhouse',
      description: 'Five-story single family townhouse built in 1845. Elevator to all levels, temperature-controlled wine cellar, and rooftop garden.',
      price: 8500000,
      propertyType: 'TOWNHOUSE',
      listingType: ListingType.SALE,
      bedrooms: 6,
      bathrooms: 6.5,
      sqft: 5800,
      city: 'New York',
      state: 'NY',
      address: '14 W 10th St',
      latitude: 40.7335,
      longitude: -73.9967,
      imageUrls: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Long Island City High-Rise Studio',
      description: 'Quick 1-stop subway to Midtown. State-of-the-art building amenities with sky deck, co-working lounge, and basketball court.',
      price: 2600,
      propertyType: 'APARTMENT',
      listingType: ListingType.RENT,
      bedrooms: 1,
      bathrooms: 1.0,
      sqft: 580,
      city: 'New York',
      state: 'NY',
      address: '42-12 28th St',
      latitude: 40.7502,
      longitude: -73.9378,
      imageUrls: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },

    // --- Seattle, WA ---
    {
      title: 'Queen Anne Pacific Northwest Modern',
      description: 'Panoramic views of Puget Sound and the Olympic Mountains. Cedar cladding, radiant floor heating, and rooftop entertainment deck.',
      price: 1875000,
      propertyType: 'HOUSE',
      listingType: ListingType.SALE,
      bedrooms: 4,
      bathrooms: 3.5,
      sqft: 3300,
      city: 'Seattle',
      state: 'WA',
      address: '1520 7th Ave W',
      latitude: 47.6328,
      longitude: -122.3664,
      imageUrls: [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'South Lake Union Tech Hub Flat',
      description: 'Walk to Amazon and Google campuses. High-speed fiber internet, pet-friendly building with rooftop dog run, and secure bike storage.',
      price: 2450,
      propertyType: 'APARTMENT',
      listingType: ListingType.RENT,
      bedrooms: 1,
      bathrooms: 1.0,
      sqft: 710,
      city: 'Seattle',
      state: 'WA',
      address: '325 9th Ave N',
      latitude: 47.6214,
      longitude: -122.3392,
      imageUrls: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Capitol Hill Historic Craftsman',
      description: 'Located in the heart of Capitol Hill near Volunteer Park. Wrap-around front porch, fir floors, and modern chef kitchen.',
      price: 1190000,
      propertyType: 'HOUSE',
      listingType: ListingType.SALE,
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 2200,
      city: 'Seattle',
      state: 'WA',
      address: '1114 18th Ave E',
      latitude: 47.6308,
      longitude: -122.3089,
      imageUrls: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Ballard Scandinavian-Style Townhome',
      description: 'Clean minimalist lines, abundant natural light, heat pump with AC, and private rooftop deck with mountain views.',
      price: 765000,
      propertyType: 'TOWNHOUSE',
      listingType: ListingType.SALE,
      bedrooms: 2,
      bathrooms: 2.0,
      sqft: 1350,
      city: 'Seattle',
      state: 'WA',
      address: '2215 NW 58th St',
      latitude: 47.6711,
      longitude: -122.3855,
      imageUrls: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Pike Place Market View Condo',
      description: 'Spectacular front-row views of Elliott Bay and the Great Wheel. Watch ferries cross from your living room.',
      price: 3200,
      propertyType: 'CONDO',
      listingType: ListingType.RENT,
      bedrooms: 2,
      bathrooms: 2.0,
      sqft: 1150,
      city: 'Seattle',
      state: 'WA',
      address: '1521 2nd Ave #1102',
      latitude: 47.6095,
      longitude: -122.3398,
      imageUrls: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Madison Park Waterfront Villa',
      description: 'Private 80-foot Lake Washington shoreline with dock. Custom stone and steel architecture, temperature controlled cellar.',
      price: 4350000,
      propertyType: 'HOUSE',
      listingType: ListingType.SALE,
      bedrooms: 5,
      bathrooms: 5.0,
      sqft: 4600,
      city: 'Seattle',
      state: 'WA',
      address: '2405 42nd Ave E',
      latitude: 47.6412,
      longitude: -122.2795,
      imageUrls: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Fremont Canal-Side Loft',
      description: 'Industrial loft steps from the Burke-Gilman Trail. 18-foot ceilings, exposed steel trusses, polished concrete, and gas fireplace.',
      price: 2750,
      propertyType: 'CONDO',
      listingType: ListingType.RENT,
      bedrooms: 1,
      bathrooms: 1.5,
      sqft: 890,
      city: 'Seattle',
      state: 'WA',
      address: '100 NW Canal St',
      latitude: 47.6521,
      longitude: -122.3582,
      imageUrls: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Green Lake Contemporary Home',
      description: 'Directly across from Green Lake path. Bright open floor plan, gourmet kitchen with waterfall island, fenced backyard.',
      price: 1395000,
      propertyType: 'HOUSE',
      listingType: ListingType.SALE,
      bedrooms: 4,
      bathrooms: 3.0,
      sqft: 2650,
      city: 'Seattle',
      state: 'WA',
      address: '7302 E Green Lake Dr N',
      latitude: 47.6815,
      longitude: -122.3274,
      imageUrls: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Belltown Modern Corner Suite',
      description: 'Floor-to-ceiling glass wrapping around two sides. Building features 24-hr concierge, gym, and guest suites.',
      price: 2200,
      propertyType: 'APARTMENT',
      listingType: ListingType.RENT,
      bedrooms: 1,
      bathrooms: 1.0,
      sqft: 680,
      city: 'Seattle',
      state: 'WA',
      address: '2600 2nd Ave #804',
      latitude: 47.6162,
      longitude: -122.3489,
      imageUrls: [
        'https://images.unsplash.com/photo-1502005229762-ee1b2da973e3?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },

    // --- Miami, FL ---
    {
      title: 'Brickell Avenue Ultra-Luxury High-Rise',
      description: 'Breathtaking Biscayne Bay views from high-floor wrap terrace. Valet parking, two infinity pools, spa, and fitness club.',
      price: 4500,
      propertyType: 'CONDO',
      listingType: ListingType.RENT,
      bedrooms: 2,
      bathrooms: 2.0,
      sqft: 1320,
      city: 'Miami',
      state: 'FL',
      address: '1421 Brickell Ave #34B',
      latitude: 25.7592,
      longitude: -80.1912,
      imageUrls: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'South Beach Art Deco Restored Gem',
      description: 'One block from the ocean. Original terrazzo flooring, restored Art Deco crown moldings, and lush private tropical garden.',
      price: 780000,
      propertyType: 'CONDO',
      listingType: ListingType.SALE,
      bedrooms: 2,
      bathrooms: 2.0,
      sqft: 1100,
      city: 'Miami',
      state: 'FL',
      address: '1040 Ocean Dr #3A',
      latitude: 25.7812,
      longitude: -80.1303,
      imageUrls: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Coconut Grove Tropical Modern Oasis',
      description: 'Seamless indoor-outdoor living surrounded by canopy banyans. Heated pool, glass-walled wine room, and smart home automation.',
      price: 2650000,
      propertyType: 'HOUSE',
      listingType: ListingType.SALE,
      bedrooms: 4,
      bathrooms: 4.5,
      sqft: 3800,
      city: 'Miami',
      state: 'FL',
      address: '3420 Main Hwy',
      latitude: 25.7238,
      longitude: -80.2441,
      imageUrls: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Coral Gables Mediterranean Estate',
      description: 'Old-world Spanish architecture with barrel tile roof, courtyard fountain, private tennis court, and guest quarters.',
      price: 3100000,
      propertyType: 'HOUSE',
      listingType: ListingType.SALE,
      bedrooms: 5,
      bathrooms: 5.5,
      sqft: 4900,
      city: 'Miami',
      state: 'FL',
      address: '1240 Coral Way',
      latitude: 25.7511,
      longitude: -80.2612,
      imageUrls: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Wynwood Designer Loft with Terrace',
      description: 'Located in Miami arts district. Soaring 16-foot ceilings, custom concrete kitchen, and steps to world-class dining and galleries.',
      price: 3100,
      propertyType: 'APARTMENT',
      listingType: ListingType.RENT,
      bedrooms: 1,
      bathrooms: 1.5,
      sqft: 980,
      city: 'Miami',
      state: 'FL',
      address: '250 NW 24th St #402',
      latitude: 25.8005,
      longitude: -80.1989,
      imageUrls: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Edgewater Bayfront Luxury Condo',
      description: 'Unobstructed bay and ocean views from every room. Floor-to-ceiling glass, private elevator vestibule, and tennis courts.',
      price: 995000,
      propertyType: 'CONDO',
      listingType: ListingType.SALE,
      bedrooms: 2,
      bathrooms: 2.5,
      sqft: 1450,
      city: 'Miami',
      state: 'FL',
      address: '600 NE 31st St #2204',
      latitude: 25.8062,
      longitude: -80.1876,
      imageUrls: [
        'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Key Biscayne Coastal Retreat',
      description: 'Private island lifestyle just minutes from downtown Miami. Walk to private beach, golf course, and harbor.',
      price: 1850000,
      propertyType: 'HOUSE',
      listingType: ListingType.SALE,
      bedrooms: 4,
      bathrooms: 3.5,
      sqft: 2900,
      city: 'Miami',
      state: 'FL',
      address: '450 Harbor Dr',
      latitude: 25.6934,
      longitude: -80.1652,
      imageUrls: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
    {
      title: 'Midtown Miami Modern Apartment',
      description: 'Trendy shops and cafes at your doorstep. Open layout, stainless steel appliances, oversized balcony, and resort-style pool.',
      price: 2800,
      propertyType: 'APARTMENT',
      listingType: ListingType.RENT,
      bedrooms: 2,
      bathrooms: 2.0,
      sqft: 1050,
      city: 'Miami',
      state: 'FL',
      address: '3301 NE 1st Ave',
      latitude: 25.8081,
      longitude: -80.1934,
      imageUrls: [
        'https://images.unsplash.com/photo-1502005229762-ee1b2da973e3?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent2.id,
    },
    {
      title: 'Venetian Islands Waterfront Villa',
      description: 'Direct wide bay sunset views. 60-foot dock with boat lift, custom Italian chef kitchen, glass wine room, and rooftop terrace.',
      price: 7900000,
      propertyType: 'HOUSE',
      listingType: ListingType.SALE,
      bedrooms: 5,
      bathrooms: 6.0,
      sqft: 5100,
      city: 'Miami',
      state: 'FL',
      address: '210 W San Marino Dr',
      latitude: 25.7915,
      longitude: -80.1601,
      imageUrls: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      ],
      agentId: agent1.id,
    },
  ];

  const createdProperties = [];
  for (const p of propertyTemplates) {
    const created = await prisma.property.create({
      data: p,
    });
    createdProperties.push(created);
  }

  console.log(`🏡 Seeded ${createdProperties.length} realistic properties.`);

  // 6. Seed Saved Properties for test buyers
  await prisma.savedProperty.createMany({
    data: [
      { userId: buyer1.id, propertyId: createdProperties[0].id },
      { userId: buyer1.id, propertyId: createdProperties[1].id },
      { userId: buyer1.id, propertyId: createdProperties[9].id },
      { userId: buyer2.id, propertyId: createdProperties[0].id },
      { userId: buyer2.id, propertyId: createdProperties[18].id },
      { userId: buyer2.id, propertyId: createdProperties[27].id },
    ],
  });

  console.log('❤️  Seeded initial saved properties.');

  // 7. Seed Initial Inquiries
  await prisma.inquiry.createMany({
    data: [
      {
        userId: buyer1.id,
        propertyId: createdProperties[0].id,
        message: 'Hi Sarah, is this property available for a private tour this Saturday?',
      },
      {
        userId: buyer2.id,
        propertyId: createdProperties[18].id,
        message: 'Hello, what are the HOA fees for this Queen Anne property?',
      },
    ],
  });

  console.log('✉️  Seeded initial inquiries.');

  // 8. Seed User Interactions for the Recommender Engine
  const interactionsData = [
    // Buyer 1 interactions (loves luxury houses in Austin & NY)
    { userId: buyer1.id, propertyId: createdProperties[0].id, actionType: InteractionType.VIEW },
    { userId: buyer1.id, propertyId: createdProperties[0].id, actionType: InteractionType.SAVE },
    { userId: buyer1.id, propertyId: createdProperties[0].id, actionType: InteractionType.INQUIRY },
    { userId: buyer1.id, propertyId: createdProperties[1].id, actionType: InteractionType.VIEW },
    { userId: buyer1.id, propertyId: createdProperties[1].id, actionType: InteractionType.SAVE },
    { userId: buyer1.id, propertyId: createdProperties[2].id, actionType: InteractionType.VIEW },
    { userId: buyer1.id, propertyId: createdProperties[3].id, actionType: InteractionType.VIEW },
    { userId: buyer1.id, propertyId: createdProperties[9].id, actionType: InteractionType.VIEW },
    { userId: buyer1.id, propertyId: createdProperties[9].id, actionType: InteractionType.SAVE },
    { userId: buyer1.id, propertyId: createdProperties[10].id, actionType: InteractionType.VIEW },

    // Buyer 2 interactions (interested in Seattle & Miami condos/houses)
    { userId: buyer2.id, propertyId: createdProperties[0].id, actionType: InteractionType.VIEW },
    { userId: buyer2.id, propertyId: createdProperties[0].id, actionType: InteractionType.SAVE },
    { userId: buyer2.id, propertyId: createdProperties[18].id, actionType: InteractionType.VIEW },
    { userId: buyer2.id, propertyId: createdProperties[18].id, actionType: InteractionType.SAVE },
    { userId: buyer2.id, propertyId: createdProperties[18].id, actionType: InteractionType.INQUIRY },
    { userId: buyer2.id, propertyId: createdProperties[22].id, actionType: InteractionType.VIEW },
    { userId: buyer2.id, propertyId: createdProperties[27].id, actionType: InteractionType.VIEW },
    { userId: buyer2.id, propertyId: createdProperties[27].id, actionType: InteractionType.SAVE },
  ];

  await prisma.userInteraction.createMany({
    data: interactionsData,
  });

  console.log(`📊 Seeded ${interactionsData.length} user interactions for recommender.`);
  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
