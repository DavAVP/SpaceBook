import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../api/supabase.config";
import type { User } from "@supabase/supabase-js";

interface UserWithAdmin extends User {
  is_admin?: boolean;
}

interface UserContextProps {
  user: UserWithAdmin | null;
  loading: boolean;
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  loading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserWithAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar el usuario al inicio
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Obtener el perfil (is_admin)
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      setUser({ ...user, is_admin: profile?.is_admin ?? false });
      setLoading(false);
    };

    loadUser();
  }, []);

  // Detectar login/logout
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Para evitar deadlock → solo disparamos reload
      setLoading(true);
      setTimeout(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUser(null);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        setUser({ ...user, is_admin: profile?.is_admin ?? false });
        setLoading(false);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
