
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzlbexwjiqqeywrpzlwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6bGJleHdqaXFxZXl3cnB6bHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDI5NDksImV4cCI6MjA3ODkxODk0OX0.W9lvvGuuuVMp4Y6mX04Gf3xsgDOkYoLXVG7VcOYn898';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Las variables de entorno de Supabase no están configuradas.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
