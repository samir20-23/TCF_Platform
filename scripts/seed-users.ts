/**
 * Seed users using Supabase Admin API
 * This script creates users in auth.users and user_profiles
 * Run with: npx tsx scripts/seed-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface UserToSeed {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'admin' | 'instructor';
}

const usersToSeed: UserToSeed[] = [
  {
    email: 'etudiant@tcfcanada.com',
    password: 'Etudiant123!',
    firstName: 'Émilie',
    lastName: 'Dubois',
    role: 'student',
  },
  {
    email: 'admin@tcfcanada.com',
    password: 'Admin123!',
    firstName: 'Administrateur',
    lastName: 'Système',
    role: 'admin',
  },
  {
    email: 'instructeur@tcfcanada.com',
    password: 'Instructeur123!',
    firstName: 'Marie',
    lastName: 'Leclerc',
    role: 'instructor',
  },
];

async function seedUsers() {
  console.log('🌱 Starting user seeding...\n');

  for (const user of usersToSeed) {
    try {
      console.log(`Creating user: ${user.email}...`);

      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === user.email);

      if (existingUser) {
        console.log(`  ⚠️  User ${user.email} already exists, updating...`);
        
        // Update user profile
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .upsert({
            id: existingUser.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role,
          }, {
            onConflict: 'id',
          });

        if (profileError) {
          console.error(`  ❌ Error updating profile: ${profileError.message}`);
        } else {
          console.log(`  ✅ Profile updated for ${user.email}`);
        }

        // Try to update password if needed (this might not work, but worth trying)
        try {
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password: user.password,
          });
          console.log(`  ✅ Password updated for ${user.email}`);
        } catch (err) {
          console.log(`  ⚠️  Could not update password (may need manual reset)`);
        }
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role,
          },
        });

        if (createError) {
          console.error(`  ❌ Error creating user: ${createError.message}`);
          continue;
        }

        if (!newUser.user) {
          console.error(`  ❌ No user returned from createUser`);
          continue;
        }

        console.log(`  ✅ User created: ${newUser.user.id}`);

        // Create user profile
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .upsert({
            id: newUser.user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role,
          }, {
            onConflict: 'id',
          });

        if (profileError) {
          console.error(`  ❌ Error creating profile: ${profileError.message}`);
        } else {
          console.log(`  ✅ Profile created for ${user.email}`);
        }
      }

      console.log(`  ✅ Completed: ${user.email}\n`);
    } catch (error: any) {
      console.error(`  ❌ Unexpected error for ${user.email}:`, error.message);
      console.log('');
    }
  }

  console.log('✨ User seeding completed!');
  console.log('\n📝 Test credentials:');
  usersToSeed.forEach((user) => {
    console.log(`  ${user.email} / ${user.password} (${user.role})`);
  });
}

seedUsers().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
