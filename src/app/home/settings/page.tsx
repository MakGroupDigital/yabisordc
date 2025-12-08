'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from "@/components/home/bottom-nav";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings, 
  Bell, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff,
  Globe,
  Moon,
  Sun,
  Languages,
  HelpCircle,
  Info,
  LogOut,
  ArrowLeft,
  Trash2,
  Download,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, updateProfile, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');
  const [language, setLanguage] = useState('fr');
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      return;
    }

    toast({
      title: "Fonctionnalité à venir",
      description: "La suppression de compte sera disponible prochainement",
      variant: "info",
    });
  };

  if (loading) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-black">
        <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-20 pb-32">
          <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
            <Skeleton className="h-12 w-full bg-gray-800" />
            <Skeleton className="h-12 w-full bg-gray-800" />
            <Skeleton className="h-12 w-full bg-gray-800" />
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <BottomNav />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white text-center p-4">
          <p className="text-lg mb-2">Connectez-vous</p>
          <Button onClick={() => router.push('/auth')} className="bg-[#FF8800] hover:bg-[#FF8800]/90">
            Se connecter
          </Button>
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <BottomNav />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/95 via-black/90 to-transparent backdrop-blur-xl border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-headline font-bold bg-gradient-to-r from-[#FFCC00] to-[#FF8800] bg-clip-text text-transparent flex-1">
              Paramètres
            </h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-20 pb-32">
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
          {/* Profil */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-[#FFCC00]" />
              Profil
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-[#FFCC00]">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-[#FF8800] text-white">
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-white font-semibold">{user.displayName || 'Utilisateur'}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push('/home/profile')}
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  Modifier
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#FFCC00]" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-likes" className="text-white">Likes</Label>
                  <p className="text-gray-400 text-sm">Recevoir des notifications pour les likes</p>
                </div>
                <Switch
                  id="notif-likes"
                  checked={notifications.likes}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, likes: checked }))}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-comments" className="text-white">Commentaires</Label>
                  <p className="text-gray-400 text-sm">Recevoir des notifications pour les commentaires</p>
                </div>
                <Switch
                  id="notif-comments"
                  checked={notifications.comments}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, comments: checked }))}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-follows" className="text-white">Abonnements</Label>
                  <p className="text-gray-400 text-sm">Recevoir des notifications pour les nouveaux abonnés</p>
                </div>
                <Switch
                  id="notif-follows"
                  checked={notifications.follows}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, follows: checked }))}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-messages" className="text-white">Messages</Label>
                  <p className="text-gray-400 text-sm">Recevoir des notifications pour les messages</p>
                </div>
                <Switch
                  id="notif-messages"
                  checked={notifications.messages}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, messages: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Confidentialité */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#FFCC00]" />
              Confidentialité
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profile-visible" className="text-white">Profil public</Label>
                  <p className="text-gray-400 text-sm">Votre profil est visible par tous</p>
                </div>
                <Switch
                  id="profile-visible"
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profileVisible: checked }))}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-email" className="text-white">Afficher l'email</Label>
                  <p className="text-gray-400 text-sm">Afficher votre email sur votre profil</p>
                </div>
                <Switch
                  id="show-email"
                  checked={privacy.showEmail}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showEmail: checked }))}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-phone" className="text-white">Afficher le téléphone</Label>
                  <p className="text-gray-400 text-sm">Afficher votre numéro de téléphone</p>
                </div>
                <Switch
                  id="show-phone"
                  checked={privacy.showPhone}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showPhone: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Apparence */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Moon className="h-5 w-5 text-[#FFCC00]" />
              Apparence
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme" className="text-white">Thème</Label>
                  <p className="text-gray-400 text-sm">Choisissez votre thème préféré</p>
                </div>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                  className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700"
                >
                  <option value="dark">Sombre</option>
                  <option value="light">Clair</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>
            </div>
          </div>

          {/* Langue */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Languages className="h-5 w-5 text-[#FFCC00]" />
              Langue
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="language" className="text-white">Langue de l'application</Label>
                  <p className="text-gray-400 text-sm">Choisissez votre langue préférée</p>
                </div>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="sw">Kiswahili</option>
                  <option value="ln">Lingala</option>
                </select>
              </div>
            </div>
          </div>

          {/* Aide et Support */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#FFCC00]" />
              Aide et Support
            </h2>
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => toast({ title: "Centre d'aide", description: "Bientôt disponible" })}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Centre d'aide
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => toast({ title: "À propos", description: "Ya Biso RDC v1.0.0" })}
              >
                <Info className="h-4 w-4 mr-2" />
                À propos
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 space-y-3">
            <Button
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer le compte
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-700 text-white hover:bg-gray-800"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

