const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  const client = await pool.connect();
  
  try {
    // 1. Read schema.sql and execute
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running schema.sql to initialize tables...');
    await client.query(schemaSql);
    console.log('Tables initialized.');

    // 2. Generate Hashed Password for Admin
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const customerPasswordHash = await bcrypt.hash('customer123', salt);

    console.log('Inserting seed users...');
    
    // Insert Admin User
    const adminRes = await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, ['Admin Biruh Tesfa', 'admin@biruhtesfa.com', adminPasswordHash, 'admin', '+251911223344']);
    
    const adminId = adminRes.rows[0].id;

    // Insert Customer User
    const customerRes = await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, ['Abebe Kebede', 'abebe@example.com', customerPasswordHash, 'customer', '+251912345678']);
    
    const customerId = customerRes.rows[0].id;

    console.log('Inserting seed categories...');
    const categories = [
      {
        slug: 'sofas',
        name_en: 'Sofas & Living',
        name_am: 'ሶፋዎች እና ሳሎን',
        image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
        sort_order: 1,
        is_active: true
      },
      {
        slug: 'bedroom',
        name_en: 'Bedroom Furniture',
        name_am: 'የመኝታ ክፍል ዕቃዎች',
        image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
        sort_order: 2,
        is_active: true
      },
      {
        slug: 'office',
        name_en: 'Office Furniture',
        name_am: 'የቢሮ ዕቃዎች',
        image_url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80',
        sort_order: 3,
        is_active: true
      },
      {
        slug: 'dining',
        name_en: 'Dining Sets',
        name_am: 'የምግብ ጠረጴዛዎች',
        image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80',
        sort_order: 4,
        is_active: true
      },
      {
        slug: 'storage',
        name_en: 'Premium Storage',
        name_am: 'ቁምሳጥን እና መደርደሪያዎች',
        image_url: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=600&q=80',
        sort_order: 5,
        is_active: true
      },
      {
        slug: 'lighting',
        name_en: 'Luxurious Lighting',
        name_am: 'የቅንጦት መብራቶች',
        image_url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=600&q=80',
        sort_order: 6,
        is_active: true
      }
    ];

    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (slug, name_en, name_am, image_url, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [cat.slug, cat.name_en, cat.name_am, cat.image_url, cat.sort_order, cat.is_active]);
    }
    console.log('Categories seeded.');

    console.log('Inserting seed products...');

    // Product Array
    const products = [
      {
        name_en: 'Royal Golden Chesterfield Sofa',
        name_am: 'የመንግሥቱ ወርቃማ ቼስተርፊልድ ሶፋ',
        description_en: 'Indulge in ultimate comfort and luxury with our signature Royal Golden Chesterfield Sofa. Upholstered in deep emerald velvet with hand-tufted details and gold-plated legs.',
        description_am: 'በፊርማችን ሮያል ወርቃማ ቼስተርፊልድ ሶፋ የመጨረሻውን ምቾት እና የቅንጦት ሁኔታ ይደሰቱ። እጅግ በጣም በሚያምር የአረንጓዴ ቬልቬት የተሸፈነ፣ በእጅ በተሰራ ጥልፍ እና በወርቅ የተለበጡ እግሮች ያሉት።',
        price_usd: 1299.00,
        price_etb: 155880.00,
        category: 'sofas',
        sub_category: 'living-room',
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
        features_en: ['High-resiliency foam cushions', 'Solid eucalyptus wood frame', 'Elegant gold-brushed steel legs', 'Premium stain-resistant velvet'],
        features_am: ['ከፍተኛ የመለጠጥ አረፋ ትራስ', 'ጠንካራ የባህር ዛፍ እንጨት ፍሬም', 'የሚያምር ወርቅ የተቦረሸረ የብረት እግሮች', 'ዋጋ ያለው እድፍ-ተከላካይ ቬልቬት'],
        dimensions_en: '220cm x 95cm x 85cm',
        dimensions_am: '220ሴሜ x 95ሴሜ x 85ሴሜ',
        stock: 5,
        rating_avg: 4.8
      },
      {
        name_en: 'Elegance Accent Velvet Armchair',
        name_am: 'ኤሌጋንስ የቬልቬት ዘና ማለጫ ወንበር',
        description_en: 'A perfect reading chair or statement piece for your living room. Curved silhouette, soft plush cushioning, and robust support.',
        description_am: 'ለሳሎንዎ ፍጹም የሆነ የንባብ ወንበር ወይም ማራኪ የጌጣጌጥ ዕቃ። የተጠማዘዘ ቅርፅ ፣ ለስላሳ ትራስ እና ጠንካራ ድጋፍ።',
        price_usd: 349.00,
        price_etb: 41880.00,
        category: 'sofas',
        sub_category: 'armchairs',
        images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80'],
        features_en: ['360-degree swivel base', 'Ergonomic lumbar support', 'Durable high-density memory foam', 'Premium upholstery'],
        features_am: ['360-ዲግሪ የሚሽከረከር መሠረት', 'ምቹ የጀርባ ድጋፍ', 'ዘላቂ ከፍተኛ-ጥቅጥቅ ባለ ሜሞሪ ፎም', 'ፕሪሚየም ጨርቅ'],
        dimensions_en: '85cm x 80cm x 90cm',
        dimensions_am: '85ሴሜ x 80ሴሜ x 90ሴሜ',
        stock: 12,
        rating_avg: 4.5
      },
      {
        name_en: 'King Size Royal Canopy Bed',
        name_am: 'ኪንግ ሳይዝ ሮያል አልጋ',
        description_en: 'Transform your bedroom into a sanctuary. Made from solid walnut wood with integrated soft-padded headboard and elegant canopy framework.',
        description_am: 'መኝታ ቤትዎን ወደ መቅደስ ይለውጡት። ከተጠናከረ የዎልት እንጨት የተሰራ ከስላሳ የጭንቅላት ሰሌዳ እና የሚያምር የሸራ መዋቅር ጋር።',
        price_usd: 1899.00,
        price_etb: 227880.00,
        category: 'bedroom',
        sub_category: 'beds',
        images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'],
        features_en: ['Premium walnut hardwood frame', 'Includes posture-pedic slatted base', 'Heavy-duty steel corner brackets', 'Custom height adjustable headboard'],
        features_am: ['ፕሪሚየም የዎልት ጠንካራ እንጨት ፍሬም', 'የአቀማመጥ-የማስተካከያ ሰሌዳዎችን ያካትታል', 'ከባድ-ግዴታ የብረት ማዕዘኖች', 'ብጁ ቁመት የሚስተካከል የጭንቅላት ሰሌዳ'],
        dimensions_en: '210cm x 220cm x 200cm',
        dimensions_am: '210ሴሜ x 220ሴሜ x 200ሴሜ',
        stock: 4,
        rating_avg: 4.9
      },
      {
        name_en: 'Modern Walnut Sliding Wardrobe',
        name_am: 'ዘመናዊ የዎልት ተንሸራታች ቁምሳጥን',
        description_en: 'Spacious wardrobe with dual sliding mirrored doors, integrated LED lighting, and smart internal compartments.',
        description_am: 'ሰፊ ቁምሳጥን ባለሁለት ተንሸራታች መስታወት በሮች ፣ የተቀናጀ የኤልኢዲ መብራት እና ዘመናዊ ውስጣዊ ክፍሎች ያሉት።',
        price_usd: 999.00,
        price_etb: 119880.00,
        category: 'bedroom',
        sub_category: 'storage',
        images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80'],
        features_en: ['Soft-close sliding mechanism', 'Tempered glass mirrors', 'Integrated motion-activated LED lights', 'Modular shelving and hanging rods'],
        features_am: ['ለስላሳ-መዝጊያ ተንሸራታች ዘዴ', 'የተጠናከረ የብርጭቆ መስተዋቶች', 'የተቀናጁ በእንቅስቃሴ የሚሰሩ የኤልኢዲ መብራቶች', 'ሞዱላር መደርደሪያዎች እና ማንጠልጠያ ዘንጎች'],
        dimensions_en: '200cm x 65cm x 220cm',
        dimensions_am: '200ሴሜ x 65ሴሜ x 220ሴሜ',
        stock: 6,
        rating_avg: 4.6
      },
      {
        name_en: 'Ergonomic Office Task Chair',
        name_am: 'ምቹ የቢሮ ወንበር',
        description_en: 'Experience absolute posture support during long working hours. Fully adjustable lumbar, armrests, and dynamic tension tilt control.',
        description_am: 'በረጅም የስራ ሰዓታት ውስጥ ሙሉ የአቀማመጥ ድጋፍን ይለማመዱ። ሙሉ በሙሉ የሚስተካከሉ የጎን ፣ የእጅ መደገፊያዎች እና ተንቀሳቃሽ የውጥረት መቆጣጠሪያ።',
        price_usd: 249.00,
        price_etb: 29880.00,
        category: 'office',
        sub_category: 'chairs',
        images: ['https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80'],
        features_en: ['Breathable mesh backrest', 'Pneumatic seat height adjustment', 'Adjustable 3D armrests', 'Heavy-duty aluminum wheelbase'],
        features_am: ['አየር የሚያስተላልፍ የጀርባ መቀመጫ', 'የመቀመጫ ቁመት ማስተካከያ', 'የሚስተካከሉ 3D የእጅ መደገፊያዎች', 'ከባድ-ግዴታ የአሉሚኒየም መሠረት'],
        dimensions_en: '65cm x 65cm x 115-125cm',
        dimensions_am: '65ሴሜ x 65ሴሜ x 115-125ሴሜ',
        stock: 20,
        rating_avg: 4.4
      },
      {
        name_en: 'Executive Solid Wood Desk',
        name_am: 'አስፈፃሚ ጠንካራ የእንጨት ጠረጴዛ',
        description_en: 'Commanding executive desk featuring high-end oak finish, integrated cable management slots, and soft-closing drawer storage.',
        description_am: 'ከፍተኛ ጥራት ካለው የኦክ አጨራረስ ፣ የተቀናጁ የገመድ ማስተላለፊያ ቀዳዳዎች እና ለስላሳ-የሚዘጉ መሳቢያዎች ያሉት አስፈፃሚ ጠረጴዛ።',
        price_usd: 699.00,
        price_etb: 83880.00,
        category: 'office',
        sub_category: 'desks',
        images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80'],
        features_en: ['Spacious double-pedestal drawer setup', 'Built-in wireless charging pad', 'Solid oak top with protective lacquer', 'Reinforced metal supports'],
        features_am: ['ሰፊ ድርብ-መሠረት መሳቢያ ዝግጅት', 'አብሮ የተሰራ ሽቦ አልባ ባትሪ መሙያ', 'ጠንካራ የኦክ ገጽታ ከላከሮች ጥበቃ ጋር', 'የተጠናከረ የብረት ድጋፎች'],
        dimensions_en: '160cm x 80cm x 75cm',
        dimensions_am: '160ሴሜ x 80ሴሜ x 75ሴሜ',
        stock: 8,
        rating_avg: 4.7
      },
      {
        name_en: '6-Seater Luxury Marble Dining Set',
        name_am: 'የ6 ሰው የቅንጦት እብነበረድ መመገቢያ ጠረጴዛ',
        description_en: 'Dine in elegance. Featuring a polished genuine white Calacatta marble tabletop, brass-plated pedestal structure, and 6 matching velvet chairs.',
        description_am: 'በምቾት ይመገቡ። የተወለወለ እውነተኛ ነጭ ካላካታ እብነበረድ የላይኛው ክፍል ፣ የናስ ንጣፍ መሠረት መዋቅር እና 6 ተዛማጅ የቬልቬት ወንበሮች።',
        price_usd: 1599.00,
        price_etb: 191880.00,
        category: 'dining',
        sub_category: 'dining-sets',
        images: ['https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80'],
        features_en: ['Real Italian Calacatta marble', 'Heat and scratch resistant sealing', 'Ergonomic high-back velvet chairs', 'Sturdy stainless steel base with brass finish'],
        features_am: ['እውነተኛ የጣሊያን ካላካታ እብነበረድ', 'ሙቀት እና ጭረት መቋቋም የሚችል ማኅተም', 'ምቹ ከፍተኛ-ጀርባ ቬልቬት ወንበሮች', 'ጠንካራ አይዝጌ ብረት መሠረት'],
        dimensions_en: '180cm x 90cm x 76cm',
        dimensions_am: '180ሴሜ x 90ሴሜ x 76ሴሜ',
        stock: 3,
        rating_avg: 4.9
      },
      {
        name_en: 'Oak Wood Accent Sideboard Credenza',
        name_am: 'የኦክ እንጨት ጌጣጌጥ ጎን ሰሌዳ',
        description_en: 'A multi-functional storage masterpiece. Crafted with beautiful natural wood grain pattern doors, opening to adjustable shelving for your tableware.',
        description_am: 'ብዙ አገልግሎት የሚሰጥ የማከማቻ ድንቅ ስራ። በሚያምር የተፈጥሮ እንጨት በር የተሰራ፣ ለመመገቢያ ዕቃዎችዎ የሚስተካከሉ መደርደሪያዎች ያሉት።',
        price_usd: 549.00,
        price_etb: 65880.00,
        category: 'storage',
        sub_category: 'sideboards',
        images: ['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80'],
        features_en: ['Four soft-close doors with hidden hinges', 'Solid oak frame and legs', 'Cable routing holes in the back', 'Adjustable internal shelves'],
        features_am: ['አራት ለስላሳ-መዝጊያ በሮች ከተደበቁ ማንጠልጠያዎች ጋር', 'ጠንካራ የኦክ ፍሬም እና እግሮች', 'በጀርባው የገመድ ማስተላለፊያ ቀዳዳዎች', 'የሚስተካከሉ የውስጥ መደርደሪያዎች'],
        dimensions_en: '150cm x 45cm x 80cm',
        dimensions_am: '150ሴሜ x 45ሴሜ x 80ሴሜ',
        stock: 7,
        rating_avg: 4.6
      },
      {
        name_en: 'Luxury Cascading Crystal Chandelier',
        name_am: 'የቅንጦት ክሪስታል ቻንደሊየር',
        description_en: 'Bring breath-taking light into your dining or living hall. Adorned with individual optical-grade crystals that capture and refract light in spectacular patterns.',
        description_am: 'በመመገቢያ ወይም በሳሎን አዳራሽዎ ውስጥ አስደናቂ ብርሃን ያምጡ። ብርሃንን በሚያስደንቅ ሁኔታ በሚያንፀባርቁ ክሪስታሎች ያጌጠ።',
        price_usd: 899.00,
        price_etb: 107880.00,
        category: 'lighting',
        sub_category: 'ceiling',
        images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=800&q=80'],
        features_en: ['K9 optical-grade crystal droplets', 'Adjustable suspension steel cords', 'Compatible with dimmable LED bulbs', 'Polished gold electroplated base'],
        features_am: ['K9 የጨረር-ደረጃ ክሪስታል ጠብታዎች', 'የሚስተካከሉ የብረት ገመዶች', 'ከሚደብዝዙ የኤልኢዲ አምፖሎች ጋር ተኳሃኝ', 'የሚያምር ወርቅ የተለበጠ መሠረት'],
        dimensions_en: 'Diameter 80cm, Height 120cm',
        dimensions_am: 'ዲያሜትር 80ሴሜ፣ ቁመት 120ሴሜ',
        stock: 5,
        rating_avg: 4.8
      },
      {
        name_en: 'Nordic Minimalist Brass Wall Sconce',
        name_am: 'የኖርዲክ ብራስ ግድግዳ መብራት',
        description_en: 'Sleek wall light featuring a brushed brass arm and white milk-glass globe shade. Perfect for bedside reading or hallway accent lighting.',
        description_am: 'የተቦረሸረ የናስ ክንድ እና ነጭ የብርጭቆ ጥላ ያለው የሚያምር የግድግዳ መብራት። ለአልጋ አጠገብ ንባብ ወይም ለአገናኝ መተላለፊያ መብራት ፍጹም።',
        price_usd: 129.00,
        price_etb: 15480.00,
        category: 'lighting',
        sub_category: 'wall',
        images: ['https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80'],
        features_en: ['Brushed solid brass construction', 'Handblown opal frosted glass globe', 'Hardwired wall plate installation', 'E27 socket compatible'],
        features_am: ['የተቦረሸረ ጠንካራ ናስ ግንባታ', 'በእጅ የተነፋ ኦፓል የብርጭቆ ዓለም', 'በግድግዳ ላይ በቀጥታ የሚገጠም', 'ከ E27 ሶኬት ጋር ተኳኝ'],
        dimensions_en: '15cm x 22cm x 30cm',
        dimensions_am: '15ሴሜ x 22ሴሜ x 30ሴሜ',
        stock: 15,
        rating_avg: 4.3
      },
      {
        name_en: 'Aero Arc Floor Lamp with Marble Base',
        name_am: 'ኤሮ አርክ ወለል መብራት ከእብነበረድ መሠረት ጋር',
        description_en: 'A timeless mid-century design. The sweeping stainless steel arm arches gracefully over your lounge furniture, anchored by a heavy Nero Marquina marble base.',
        description_am: 'ጊዜ የማይሽረው የክፍለ-ዘመን ንድፍ። በከባድ ጥቁር እብነበረድ መሠረት የተደገፈ እና በሳሎንዎ ላይ በጸጋ የሚንጠለጠል አይዝጌ ብረት ክንድ ያለው።',
        price_usd: 299.00,
        price_etb: 35880.00,
        category: 'lighting',
        sub_category: 'floor',
        images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'],
        features_en: ['Extending stainless steel arch', 'Heavy natural black marble block base', 'Foot-switch control on power cord', 'Satin finish dome reflector'],
        features_am: ['የሚረዝም አይዝጌ ብረት አርክ', 'ከባድ የተፈጥሮ ጥቁር እብነበረድ መሠረት', 'የእግር ማብሪያ መቆጣጠሪያ በኃይል ገመድ ላይ', 'የሳቲን አጨራረስ ነጸብራቅ'],
        dimensions_en: 'Reach 160cm, Height 210cm',
        dimensions_am: 'ርዝመት 160ሴሜ፣ ቁመት 210ሴሜ',
        stock: 9,
        rating_avg: 4.7
      },
      {
        name_en: 'Smart Neo LED Ambient Light Bar',
        name_am: 'ስማርት ኒዮ የሊድ ድባብ ብርሃን ባር',
        description_en: 'Create the ultimate lighting atmosphere. Wirelessly controlled RGB LED strip bar, offering customizable presets and syncing with music or screen colors.',
        description_am: 'ፍጹም የብርሃን ድባብ ይፍጠሩ። በገመድ አልባ ቁጥጥር የሚደረግበት የ RGB LED ስትሪፕ ባር ፣ የተለያዩ ቀለሞች ምርጫ ያለው እና ከሙዚቃ ጋር የሚስማማ።',
        price_usd: 89.00,
        price_etb: 10680.00,
        category: 'lighting',
        sub_category: 'led',
        images: ['https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'],
        features_en: ['16 million colors with dimming', 'App, remote, and voice-command control', 'Music synchronization sensor built-in', 'USB-powered low voltage safety'],
        features_am: ['16 ሚሊዮን ቀለሞች ከማደብዘዣ ጋር', 'በመተግበሪያ፣ በሩቅ እና በድምጽ መቆጣጠሪያ', 'የሙዚቃ ማመሳሰል ዳሳሽ አብሮ የተሰራ', 'በዩኤስቢ የሚሰራ ዝቅተኛ ቮልቴጅ'],
        dimensions_en: 'Length 100cm',
        dimensions_am: 'ርዝመት 100ሴሜ',
        stock: 30,
        rating_avg: 4.6
      }
    ];

    // Seed products & get their IDs for reviews mapping
    const insertedProducts = [];
    for (const prod of products) {
      const res = await client.query(`
        INSERT INTO products (
          name_en, name_am, description_en, description_am, 
          price_usd, price_etb, category, sub_category, 
          images, features_en, features_am, dimensions_en, dimensions_am, 
          stock, rating_avg
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, name_en
      `, [
        prod.name_en, prod.name_am, prod.description_en, prod.description_am,
        prod.price_usd, prod.price_etb, prod.category, prod.sub_category,
        prod.images, prod.features_en, prod.features_am, prod.dimensions_en, prod.dimensions_am,
        prod.stock, prod.rating_avg
      ]);
      insertedProducts.push(res.rows[0]);
    }
    console.log(`Inserted ${insertedProducts.length} products.`);

    console.log('Inserting seed reviews...');
    // Review seed
    const reviews = [
      {
        product_name: 'Royal Golden Chesterfield Sofa',
        rating: 5,
        user_name: 'Martha Belay',
        comment: 'This sofa is breathtaking! Everyone who enters my home asks where I got it. Highly recommend Biruh Tesfa!'
      },
      {
        product_name: 'Royal Golden Chesterfield Sofa',
        rating: 4,
        user_name: 'Dawit Solomon',
        comment: 'Very comfortable and luxurious. Delivery to Bole was quick and assembly was done professionally.'
      },
      {
        product_name: 'King Size Royal Canopy Bed',
        rating: 5,
        user_name: 'Ruth Haile',
        comment: 'Absolutely love the wood quality! Worth every single birr.'
      },
      {
        product_name: 'Modern Walnut Sliding Wardrobe',
        rating: 4,
        user_name: 'Yonas Kassa',
        comment: 'Excellent spacious design. The LED light bars inside are super helpful.'
      },
      {
        product_name: 'Luxury Cascading Crystal Chandelier',
        rating: 5,
        user_name: 'Eleni Tedla',
        comment: 'The lighting is stunning. It adds such a premium touch to our dining hall!'
      }
    ];

    for (const rev of reviews) {
      // Find matching product ID
      const matchingProd = insertedProducts.find(p => p.name_en === rev.product_name);
      if (matchingProd) {
        await client.query(`
          INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
          VALUES ($1, $2, $3, $4, $5)
        `, [matchingProd.id, customerId, rev.user_name, rev.rating, rev.comment]);
      }
    }
    console.log('Reviews seeded.');

    console.log('Inserting seed gallery posts...');
    
    // Gallery seed
    const galleryItems = [
      {
        title_en: 'Modern Addis Living Room Inspiration',
        title_am: 'ዘመናዊ አዲስ የሳሎን ክፍል መነሳሳት',
        image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
        description_en: 'A fully furnished living space in Bole, Addis Ababa, combining our Emerald Chesterfield Sofa with ambient warm ceiling lights.',
        description_am: 'በቦሌ ፣ አዲስ አበባ የሚገኝ ሙሉ በሙሉ የታጠቁ የመኖሪያ ቦታ ፣ የእኛን ኤመራልድ ቼስተርፊልድ ሶፋ ከሞቃት የጣሪያ መብራቶች ጋር ያገናኘ።',
        sort_order: 1,
        is_published: true
      },
      {
        title_en: 'Luxury Suite Bedroom Makeover',
        title_am: 'የቅንጦት መኝታ ቤት ለውጥ',
        image_url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
        description_en: 'Featuring the King Size Canopy Bed and modern wood sliding wardrobe, completed with custom bedroom nightstands.',
        description_am: 'የኪንግ ሳይዝ ሮያል አልጋ እና ዘመናዊ የእንጨት ተንሸራታች ቁምሳጥን ፣ ከዘመናዊ የምሽት መደርደሪያዎች ጋር የተሠራ መኝታ ክፍል።',
        sort_order: 2,
        is_published: true
      },
      {
        title_en: 'Biruh Tesfa Showroom Display',
        title_am: 'ብሩህ ተስፋ የዕቃዎች ማሳያ',
        image_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
        description_en: 'A peak into our main showroom layout, highlighting our premium wooden executive office tables and dining sets.',
        description_am: 'የእኛን ዋና የማሳያ ክፍል አቀማመጥ፣ የእንጨት አስፈፃሚ የቢሮ ጠረጴዛዎቻችንን እና የመመገቢያ ስብስቦችን የሚያሳይ።',
        sort_order: 3,
        is_published: true
      }
    ];

    for (const gal of galleryItems) {
      await client.query(`
        INSERT INTO gallery (title_en, title_am, image_url, description_en, description_am, sort_order, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [gal.title_en, gal.title_am, gal.image_url, gal.description_en, gal.description_am, gal.sort_order, gal.is_published]);
    }
    console.log('Gallery posts seeded.');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    client.release();
  }
}

// If run directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
