import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Load .env from root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
dotenv.config({ path: join(rootDir, '.env') });

// Supabase credentials - pass via environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const testPassword = process.env.TEST_USER_PASSWORD || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TestUser {
  email: string;
  password: string;
  familyName: string;
  profileName: string;
}

const TEST_USER: TestUser = {
  email: 'maxmustermann@familyplanner.com',
  password: testPassword,
  familyName: 'Familie Mustermann',
  profileName: 'Max Mustermann',
};

async function cleanupTestData() {
  console.log('🧹 Cleaning up existing test data...\n');

  try {
    // 1. Find existing user
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users?.users.find((u) => u.email === TEST_USER.email);
    
    if (!existingUser) {
      console.log('ℹ️  No existing test user found, skipping cleanup\n');
      return null;
    }

    const userId = existingUser.id;
    console.log(`📍 Found existing user: ${TEST_USER.email} (${userId})`);

    // 2. Find ALL profiles for this user to get family_ids
    const { data: profiles } = await supabase
      .from('profiles')
      .select('family_id')
      .eq('user_id', userId);

    if (profiles && profiles.length > 0) {
      const familyIds = [...new Set(profiles.map(p => p.family_id))];
      console.log(`📍 Found ${familyIds.length} familie(s): ${familyIds.join(', ')}`);

      // Delete all family data for each family
      for (const familyId of familyIds) {
        console.log(`🗑️  Deleting all data for family ${familyId}...`);
        
        // Delete recipes and ingredients first (due to FK)
        const { data: recipes } = await supabase.from('recipes').select('id').eq('family_id', familyId);
        if (recipes && recipes.length > 0) {
          const recipeIds = recipes.map(r => r.id);
          await supabase.from('recipe_ingredients').delete().in('recipe_id', recipeIds);
        }
        await supabase.from('recipes').delete().eq('family_id', familyId);
        
        // Delete all other family data
        await supabase.from('todos').delete().eq('family_id', familyId);
        await supabase.from('calendar_events').delete().eq('family_id', familyId);
        await supabase.from('shopping_items').delete().eq('family_id', familyId);
        await supabase.from('notes').delete().eq('family_id', familyId);
        await supabase.from('contacts').delete().eq('family_id', familyId);
        await supabase.from('contact_families').delete().eq('family_id', familyId);
        await supabase.from('profiles').delete().eq('family_id', familyId);
        await supabase.from('families').delete().eq('id', familyId);
        
        console.log(`   ✅ Family ${familyId} deleted`);
      }
    }

    console.log('✅ Cleanup completed (keeping user for reuse)\n');
    return userId;
  } catch (error) {
    console.log('⚠️  Cleanup failed:', error);
    return null;
  }
}

async function seedTestData(existingUserId?: string | null) {
  console.log('🌱 Starting seed process...\n');

  try {
    // Helper functions
    async function createOrReuseUser(existingUserId?: string | null) {
      if (existingUserId) {
        console.log('👤 Reusing existing test user...');
        console.log(`✅ User found: ${TEST_USER.email} (${existingUserId})\n`);
        return existingUserId;
      } else {
        console.log('👤 Creating test user...');
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: TEST_USER.email,
          password: TEST_USER.password,
          email_confirm: true,
        });
        if (authError) throw authError;
        const userId = authData.user!.id;
        console.log(`✅ User created: ${TEST_USER.email} (${userId})\n`);
        return userId;
      }
    }

    async function createOrReuseFamily() {
      console.log('👨‍👩‍👧‍👦 Creating test family...');
      let { data: existingFamily } = await supabase
        .from('families')
        .select('*')
        .eq('name', TEST_USER.familyName)
        .single();
      if (existingFamily) {
        console.log('⚠️  Family already exists, using existing family...');
        return existingFamily;
      } else {
        const { data: newFamily, error: familyError } = await supabase
          .from('families')
          .insert({ name: TEST_USER.familyName })
          .select()
          .single();
        if (familyError) throw familyError;
        return newFamily;
      }
    }

    async function createProfile(userId: string, familyId: string) {
      console.log('📝 Creating profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          family_id: familyId,
          name: TEST_USER.profileName,
        })
        .select()
        .single();
      if (profileError) throw profileError;
      console.log(`✅ Profile created: ${TEST_USER.profileName} (${profile.id})\n`);
      return profile;
    }

    // Main logic
    const userId = await createOrReuseUser(existingUserId);
    const family = await createOrReuseFamily();
    const familyId = family.id;
    const profile = await createProfile(userId, familyId);
    const profileId = profile.id;

    // 4. Create Todos
    console.log('📝 Creating todos...');
    const todos = [
      {
        family_id: familyId,
        task: 'Einkaufen gehen',
        description: 'Milch, Brot, Butter besorgen',
        isDone: false,
        assigned_to_id: profileId,
        created_by_id: profileId,
        due_at: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        family_id: familyId,
        task: 'Auto waschen',
        description: 'Innen und außen',
        isDone: false,
        assigned_to_id: profileId,
        created_by_id: profileId,
        due_at: new Date(Date.now() + 2 * 86400000).toISOString(),
      },
      {
        family_id: familyId,
        task: 'Rasen mähen',
        description: 'Auch hinten im Garten',
        isDone: true,
        assigned_to_id: profileId,
        created_by_id: profileId,
        done_by_id: profileId,
        done_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        family_id: familyId,
        task: 'Steuererklärung vorbereiten',
        description: 'Belege sortieren',
        isDone: false,
        assigned_to_id: profileId,
        created_by_id: profileId,
        due_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
      {
        family_id: familyId,
        task: 'Arzttermin vereinbaren',
        description: 'Für Vorsorgeuntersuchung',
        isDone: false,
        assigned_to_id: profileId,
        created_by_id: profileId,
        due_at: new Date(Date.now() + 3 * 86400000).toISOString(),
      },
      {
        family_id: familyId,
        task: 'Fenster putzen',
        description: 'Alle Fenster im Haus',
        isDone: false,
        assigned_to_id: profileId,
        created_by_id: profileId,
        due_at: new Date(Date.now() + 5 * 86400000).toISOString(),
      },
      {
        family_id: familyId,
        task: 'Geburtstagsgeschenk kaufen',
        description: 'Für Tante Else',
        isDone: true,
        assigned_to_id: profileId,
        created_by_id: profileId,
        done_by_id: profileId,
        done_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        family_id: familyId,
        task: 'Keller aufräumen',
        description: 'Alte Sachen aussortieren',
        isDone: false,
        assigned_to_id: profileId,
        created_by_id: profileId,
        due_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      },
      {
        family_id: familyId,
        task: 'Fahrräder reparieren',
        description: 'Reifen aufpumpen, Kette ölen',
        isDone: false,
        assigned_to_id: profileId,
        created_by_id: profileId,
        due_at: new Date(Date.now() + 6 * 86400000).toISOString(),
      },
      {
        family_id: familyId,
        task: 'Urlaubsfotos sortieren',
        description: 'Vom letzten Sommer',
        isDone: true,
        assigned_to_id: profileId,
        created_by_id: profileId,
        done_by_id: profileId,
        done_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        family_id: familyId,
        task: 'Blumen gießen',
        description: 'Balkon und Wohnzimmer',
        isDone: false,
        assigned_to_id: profileId,
        created_by_id: profileId,
        due_at: new Date(Date.now() + 1 * 86400000).toISOString(),
      },
      {
        family_id: familyId,
        task: 'Müll rausbringen',
        description: 'Gelbe Tonne ist voll',
        isDone: true,
        assigned_to_id: profileId,
        created_by_id: profileId,
        done_by_id: profileId,
        done_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];

    const { error: todosError } = await supabase.from('todos').insert(todos);
    if (todosError) throw todosError;
    console.log(`✅ ${todos.length} todos created\n`);

    // 5. Create Calendar Events
    console.log('📅 Creating calendar events...');
    const events = [
      {
        family_id: familyId,
        title: 'Zahnarzttermin',
        description: 'Dr. Schmidt, Kontrolluntersuchung',
        event_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        event_time: '14:30',
        created_by_id: userId,
      },
      {
        family_id: familyId,
        title: 'Familienessen',
        description: 'Bei Oma und Opa',
        event_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        event_time: '18:00',
        created_by_id: userId,
      },
      {
        family_id: familyId,
        title: 'Geburtstag Tim',
        description: 'Geschenk nicht vergessen!',
        event_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        event_time: '15:00',
        created_by_id: userId,
      },
      {
        family_id: familyId,
        title: 'Elternabend Schule',
        description: 'Aula, 2. Stock',
        event_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        event_time: '19:00',
        created_by_id: userId,
      },
      {
        family_id: familyId,
        title: 'Konzert Elbphilharmonie',
        description: 'Tickets ausdrucken!',
        event_date: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
        event_time: '20:00',
        created_by_id: userId,
      },
      {
        family_id: familyId,
        title: 'Autowerkstatt',
        description: 'Inspektion fällig',
        event_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        event_time: '08:00',
        created_by_id: userId,
      },
      {
        family_id: familyId,
        title: 'Friseur',
        description: 'Haare schneiden',
        event_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        event_time: '16:00',
        created_by_id: userId,
      },
      {
        family_id: familyId,
        title: 'Sportverein Jahreshauptversammlung',
        description: 'Turnhalle',
        event_date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
        event_time: '18:30',
        created_by_id: userId,
      },
      {
        family_id: familyId,
        title: 'Kinderarzt Vorsorge',
        description: 'U9 Untersuchung',
        event_date: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
        event_time: '10:30',
        created_by_id: userId,
      },
      {
        family_id: familyId,
        title: 'Grillabend mit Nachbarn',
        description: 'Bei Familie Meyer',
        event_date: new Date(Date.now() + 16 * 86400000).toISOString().split('T')[0],
        event_time: '18:00',
        created_by_id: userId,
      },
      {
        family_id: familyId,
        title: 'Yoga-Kurs',
        description: 'Probemonat',
        event_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        event_time: '17:30',
        created_by_id: userId,
      },
      {
        family_id: familyId,
        title: 'Handwerker kommt',
        description: 'Waschmaschine reparieren',
        event_date: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
        event_time: '14:00',
        created_by_id: userId,
      },
    ];

    const { error: eventsError } = await supabase.from('calendar_events').insert(events);
    if (eventsError) throw eventsError;
    console.log(`✅ ${events.length} calendar events created\n`);

    // 6. Create Shopping Items
    console.log('🛒 Creating shopping items...');
    const shoppingItems = [
      {
        family_id: familyId,
        name: 'Milch',
        quantity: '2',
        unit: 'Liter',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        name: 'Brot',
        quantity: '1',
        unit: 'Stück',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        name: 'Äpfel',
        quantity: '1',
        unit: 'kg',
        created_by_id: profileId,
        store: 'REWE',
      },
      {
        family_id: familyId,
        name: 'Toilettenpapier',
        quantity: '1',
        unit: 'Packung',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        name: 'Butter',
        quantity: '250',
        unit: 'g',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        name: 'Eier',
        quantity: '10',
        unit: 'Stück',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        name: 'Tomaten',
        quantity: '500',
        unit: 'g',
        created_by_id: profileId,
        store: 'EDEKA',
      },
      {
        family_id: familyId,
        name: 'Kaffeebohnen',
        quantity: '1',
        unit: 'Packung',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        name: 'Käse',
        quantity: '200',
        unit: 'g',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        name: 'Nudeln',
        quantity: '500',
        unit: 'g',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        name: 'Schokolade',
        quantity: '3',
        unit: 'Tafeln',
        created_by_id: profileId,
        store: 'Kaufland',
      },
      {
        family_id: familyId,
        name: 'Joghurt',
        quantity: '6',
        unit: 'Becher',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        name: 'Mineralwasser',
        quantity: '2',
        unit: 'Kisten',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        name: 'Waschmittel',
        quantity: '1',
        unit: 'Flasche',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        name: 'Bananen',
        quantity: '1',
        unit: 'Staude',
        created_by_id: profileId,
      },
    ];

    const { error: shoppingError } = await supabase.from('shopping_items').insert(shoppingItems);
    if (shoppingError) throw shoppingError;
    console.log(`✅ ${shoppingItems.length} shopping items created\n`);

    // 7. Create Recipes
    console.log('🍳 Creating recipes...');
    const recipes = [
      {
        name: 'Spaghetti Carbonara',
        instructions: '1. Spaghetti kochen\n2. Speck anbraten\n3. Eier mit Parmesan verquirlen\n4. Alles vermengen',
        servings: 4,
        ingredients: [
          { name: 'Spaghetti', quantity: '500', unit: 'g' },
          { name: 'Speck', quantity: '200', unit: 'g' },
          { name: 'Eier', quantity: '4', unit: 'Stück' },
          { name: 'Parmesan', quantity: '100', unit: 'g' },
        ],
      },
      {
        name: 'Tomatensuppe',
        instructions: '1. Zwiebeln anschwitzen\n2. Tomaten hinzufügen\n3. Mit Brühe ablöschen\n4. Pürieren',
        servings: 2,
        ingredients: [
          { name: 'Tomaten', quantity: '500', unit: 'g' },
          { name: 'Zwiebeln', quantity: '2', unit: 'Stück' },
          { name: 'Gemüsebrühe', quantity: '500', unit: 'ml' },
        ],
      },
      {
        name: 'Chili con Carne',
        instructions: '1. Zwiebeln und Hackfleisch anbraten\n2. Bohnen und Tomaten hinzufügen\n3. Würzen und köcheln lassen',
        servings: 6,
        ingredients: [
          { name: 'Hackfleisch', quantity: '500', unit: 'g' },
          { name: 'Kidneybohnen', quantity: '400', unit: 'g' },
          { name: 'Tomaten (Dose)', quantity: '400', unit: 'g' },
          { name: 'Zwiebeln', quantity: '2', unit: 'Stück' },
          { name: 'Chili', quantity: '1', unit: 'TL' },
        ],
      },
      {
        name: 'Pfannkuchen',
        instructions: '1. Alle Zutaten verrühren\n2. In der Pfanne ausbacken\n3. Mit Nutella oder Marmelade servieren',
        servings: 4,
        ingredients: [
          { name: 'Mehl', quantity: '250', unit: 'g' },
          { name: 'Milch', quantity: '500', unit: 'ml' },
          { name: 'Eier', quantity: '3', unit: 'Stück' },
          { name: 'Zucker', quantity: '2', unit: 'EL' },
        ],
      },
      {
        name: 'Caesar Salad',
        instructions: '1. Römersalat waschen\n2. Hähnchenstreifen braten\n3. Mit Dressing und Croutons anrichten',
        servings: 2,
        ingredients: [
          { name: 'Römersalat', quantity: '1', unit: 'Kopf' },
          { name: 'Hähnchenbrustfilet', quantity: '300', unit: 'g' },
          { name: 'Parmesan', quantity: '50', unit: 'g' },
          { name: 'Croutons', quantity: '100', unit: 'g' },
        ],
      },
      {
        name: 'Gulasch',
        instructions: '1. Fleisch anbraten\n2. Zwiebeln und Paprika hinzufügen\n3. Mit Brühe ablöschen und schmoren',
        servings: 4,
        ingredients: [
          { name: 'Rindergulasch', quantity: '600', unit: 'g' },
          { name: 'Zwiebeln', quantity: '3', unit: 'Stück' },
          { name: 'Paprika', quantity: '2', unit: 'Stück' },
          { name: 'Tomatenmark', quantity: '2', unit: 'EL' },
          { name: 'Rinderbrühe', quantity: '500', unit: 'ml' },
        ],
      },
      {
        name: 'Kartoffelgratin',
        instructions: '1. Kartoffeln schälen und in Scheiben schneiden\n2. Schichten mit Sahne und Käse\n3. Im Ofen überbacken',
        servings: 4,
        ingredients: [
          { name: 'Kartoffeln', quantity: '1', unit: 'kg' },
          { name: 'Sahne', quantity: '400', unit: 'ml' },
          { name: 'Käse (gerieben)', quantity: '150', unit: 'g' },
          { name: 'Knoblauch', quantity: '2', unit: 'Zehen' },
        ],
      },
      {
        name: 'Chicken Curry',
        instructions: '1. Hähnchen anbraten\n2. Currypaste hinzufügen\n3. Mit Kokosmilch ablöschen und köcheln',
        servings: 4,
        ingredients: [
          { name: 'Hähnchenbrustfilet', quantity: '500', unit: 'g' },
          { name: 'Kokosmilch', quantity: '400', unit: 'ml' },
          { name: 'Currypaste', quantity: '2', unit: 'EL' },
          { name: 'Paprika', quantity: '1', unit: 'Stück' },
        ],
      },
      {
        name: 'Lasagne',
        instructions: '1. Bolognese kochen\n2. Béchamelsauce zubereiten\n3. Schichten und im Ofen backen',
        servings: 6,
        ingredients: [
          { name: 'Lasagneplatten', quantity: '250', unit: 'g' },
          { name: 'Hackfleisch', quantity: '500', unit: 'g' },
          { name: 'Tomaten (passiert)', quantity: '400', unit: 'g' },
          { name: 'Mozzarella', quantity: '200', unit: 'g' },
          { name: 'Parmesan', quantity: '100', unit: 'g' },
        ],
      },
      {
        name: 'Ratatouille',
        instructions: '1. Gemüse in Würfel schneiden\n2. Nacheinander anbraten\n3. Mit Kräutern würzen und schmoren',
        servings: 4,
        ingredients: [
          { name: 'Aubergine', quantity: '1', unit: 'Stück' },
          { name: 'Zucchini', quantity: '2', unit: 'Stück' },
          { name: 'Paprika', quantity: '2', unit: 'Stück' },
          { name: 'Tomaten', quantity: '400', unit: 'g' },
          { name: 'Knoblauch', quantity: '3', unit: 'Zehen' },
        ],
      },
    ];

    let recipeCount = 0;
    for (const recipe of recipes) {
      const { data: newRecipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          family_id: familyId,
          name: recipe.name,
          instructions: recipe.instructions,
          servings: recipe.servings,
          created_by_id: profileId,
        })
        .select()
        .single();
      if (recipeError) throw recipeError;
      const ingredients = recipe.ingredients.map((ing, idx) => ({
        recipe_id: newRecipe.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        add_to_shopping: false,
        order_index: idx,
      }));
      const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(ingredients);
      if (ingredientsError) throw ingredientsError;
      recipeCount++;
    }
    console.log(`✅ ${recipeCount} recipes with ingredients created\n`);

    // 8. Create Contacts
    console.log('👥 Creating contacts...');
    const contactFamilies = [
      {
        family_name: 'Familie Schmidt',
        street: 'Hauptstraße',
        house_number: '42',
        zip: '12345',
        city: 'Berlin',
        contacts: [
          { first_name: 'Peter', last_name: 'Schmidt', birthdate: '1980-05-15', phone: '+49 170 1234567', email: 'peter@schmidt.de' },
          { first_name: 'Maria', last_name: 'Schmidt', birthdate: '1982-08-20', phone: '+49 170 7654321', email: 'maria@schmidt.de' },
        ],
      },
      {
        family_name: 'Familie Meyer',
        street: 'Gartenweg',
        house_number: '7',
        zip: '54321',
        city: 'Hamburg',
        contacts: [
          { first_name: 'Thomas', last_name: 'Meyer', birthdate: '1975-03-10', phone: '+49 171 9876543', email: 'thomas@meyer.de' },
          { first_name: 'Susanne', last_name: 'Meyer', birthdate: '1978-11-25', phone: '+49 171 3456789' },
        ],
      },
      {
        family_name: 'Familie Müller',
        street: 'Bahnhofstraße',
        house_number: '15',
        zip: '67890',
        city: 'München',
        contacts: [
          { first_name: 'Andreas', last_name: 'Müller', birthdate: '1985-07-04', phone: '+49 172 2468135' },
          { first_name: 'Julia', last_name: 'Müller', birthdate: '1987-12-30', email: 'julia@mueller.de' },
        ],
      },
    ];

    const singleContacts = [
      { first_name: 'Oma', last_name: 'Else', birthdate: '1945-04-12', phone: '+49 30 1234567' },
      { first_name: 'Opa', last_name: 'Hans', birthdate: '1943-09-08', phone: '+49 30 7654321' },
      { first_name: 'Tante', last_name: 'Gisela', birthdate: '1965-06-18', email: 'gisela@web.de' },
      { first_name: 'Onkel', last_name: 'Klaus', birthdate: '1960-02-22', phone: '+49 171 5551234' },
    ];

    let totalContacts = 0;
    for (const family of contactFamilies) {
      const { data: newFamily, error: familyError } = await supabase
        .from('contact_families')
        .insert({
          family_id: familyId,
          family_name: family.family_name,
          street: family.street,
          house_number: family.house_number,
          zip: family.zip,
          city: family.city,
        })
        .select()
        .single();
      if (familyError) throw familyError;
      const familyContacts = family.contacts.map((c) => ({
        family_id: familyId,
        contact_family_id: newFamily.id,
        first_name: c.first_name,
        last_name: c.last_name,
        birthdate: c.birthdate,
        phone: c.phone,
        email: c.email,
      }));
      const { error: contactsError } = await supabase.from('contacts').insert(familyContacts);
      if (contactsError) throw contactsError;
      totalContacts += familyContacts.length;
    }
    const singleContactsData = singleContacts.map((c) => ({
      family_id: familyId,
      first_name: c.first_name,
      last_name: c.last_name,
      birthdate: c.birthdate,
      phone: c.phone,
      email: c.email,
    }));
    const { error: singleContactsError } = await supabase.from('contacts').insert(singleContactsData);
    if (singleContactsError) throw singleContactsError;
    totalContacts += singleContactsData.length;

    console.log(`✅ ${contactFamilies.length} contact families + ${singleContactsData.length} individual contacts = ${totalContacts} total contacts created\n`);

    // 9. Create Notes
    console.log('🗒️ Creating notes...');
    const notes = [
      {
        family_id: familyId,
        title: 'Einkaufsliste für Party',
        content: '- Chips\n- Getränke\n- Dip\n- Pizza\n- Salate\n- Kuchen',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        title: 'Urlaubsplanung 2026',
        content: 'Mögliche Ziele:\n- Italien (Toskana)\n- Spanien (Barcelona)\n- Frankreich (Provence)\n\nBudget: 3000€\nZeitraum: Juli-August',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        title: 'Wichtige Telefonnummern',
        content: 'Hausarzt: 030-12345678\nKindergarten: 030-87654321\nNotfall: 112\nHandwerker: 030-99887766',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        title: 'Geschenkideen Geburtstage',
        content: 'Tim: Lego Star Wars\nAnna: Bücher\nOma: Blumen\nPapa: Werkzeug',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        title: 'Renovierung Kinderzimmer',
        content: 'Farbe: Hellblau\nNeue Möbel:\n- Schreibtisch\n- Regal\n- Lampe\n\nBudget: 800€',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        title: 'Wochenplanung Essen',
        content: 'Mo: Spaghetti\nDi: Salat\nMi: Gulasch\nDo: Pizza\nFr: Fisch\nSa: Grillen\nSo: Braten',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        title: 'Fitness Routine',
        content: 'Montag: Joggen 5km\nMittwoch: Yoga\nFreitag: Schwimmen\nSonntag: Radtour',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        title: 'Bücherliste',
        content: 'Zu lesen:\n- Der Alchemist\n- Sapiens\n- Homo Deus\n- Das Café am Rande der Welt',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        title: 'Garten TODO',
        content: '- Rasen vertikutieren\n- Hecke schneiden\n- Blumen pflanzen\n- Terrasse streichen',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        title: 'Versicherungen Übersicht',
        content: 'KFZ: Allianz, erneuert 06/2026\nHausrat: HUK, bis 12/2026\nHaftpflicht: ERGO, bis 03/2027',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        title: 'Passwörter & Zugänge',
        content: 'WLAN: MustermannFibre2024\nNetflix: max@mustermann.de\nSpotify: family.mustermann',
        created_by_id: profileId,
      },
      {
        family_id: familyId,
        title: 'Filme & Serien Watchlist',
        content: 'Filme:\n- Inception\n- Interstellar\n\nSerien:\n- Breaking Bad\n- Stranger Things',
        created_by_id: profileId,
      },
    ];

    const { error: notesError } = await supabase.from('notes').insert(notes);
    if (notesError) throw notesError;
    console.log(`✅ ${notes.length} notes created\n`);

    // Summary
    console.log('\n✅ ✅ ✅ Seeding completed successfully! ✅ ✅ ✅\n');
    console.log('📊 Summary:');
    console.log(`   👤 User: ${TEST_USER.email}`);
    console.log(`   🔑 Password: ${TEST_USER.password.substring(0, 3)}${'*'.repeat(TEST_USER.password.length - 3)}`);
    console.log(`   👨‍👩‍👧‍👦 Family: ${TEST_USER.familyName}`);
    console.log(`   📝 Todos: ${todos.length}`);
    console.log(`   📅 Events: ${events.length}`);
    console.log(`   🛒 Shopping Items: ${shoppingItems.length}`);
    console.log(`   🍳 Recipes: ${recipeCount}`);
    console.log(`   👥 Contacts: ${totalContacts}`);
    console.log(`   🗒️ Notes: ${notes.length}`);
    console.log('\n🎉 You can now log in with the test user!\n');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run cleanup first, then seed
const existingUserId = await cleanupTestData();
await seedTestData(existingUserId);


