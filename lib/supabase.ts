
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bashuaievpeigrlrfiut.supabase.co';
const supabaseAnonKey = 'sb_publishable_vxEEamwm7oPQbteHVUnqTQ_u2zcHz6H';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
