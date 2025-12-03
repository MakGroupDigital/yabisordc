'use client';

import { useState, useRef, useEffect } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { Hotel, ArrowLeft, Filter, X, Heart, Share2, Calendar as CalendarIcon, MapPin, Star, Users, Bed, Loader2, CreditCard, Smartphone, Wallet, Download, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createCinetpayPayment, openCinetpayPaymentPage, checkCinetpayPaymentStatus } from '@/lib/cinetpay';
import { createPayPalPayment, openPayPalPaymentPage, checkPayPalOrderStatus, capturePayPalOrder } from '@/lib/paypal';

interface Hebergement {
  id: string;
  nom: string;
  description: string;
  images: string[];
  prixParJour: number;
  type: 'hotel' | 'auberge' | 'lieu';
  ville: string;
  province: string;
  rating: number;
  nombreAvis: number;
}

const hebergements: Hebergement[] = [
  {
    id: '1',
    nom: 'Hôtel Grand Kivu',
    description: 'Hôtel de luxe avec vue sur le lac Kivu',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a0d9b8c0b0e?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    ],
    prixParJour: 120,
    type: 'hotel',
    ville: 'Goma',
    province: 'Nord-Kivu',
    rating: 4.7,
    nombreAvis: 234
  },
  {
    id: '2',
    nom: 'Auberge du Lac',
    description: 'Auberge confortable au bord du lac',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    ],
    prixParJour: 45,
    type: 'auberge',
    ville: 'Bukavu',
    province: 'Sud-Kivu',
    rating: 4.5,
    nombreAvis: 156
  },
  {
    id: '3',
    nom: 'Lodge Safari',
    description: 'Lodge écologique en pleine nature',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a0d9b8c0b0e?w=800&q=80',
    ],
    prixParJour: 85,
    type: 'lieu',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    rating: 4.8,
    nombreAvis: 189
  },
  {
    id: '4',
    nom: 'Hôtel Président',
    description: 'Hôtel moderne au centre-ville',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    ],
    prixParJour: 95,
    type: 'hotel',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    rating: 4.6,
    nombreAvis: 312
  },
];

const provinces = ['Toutes', 'Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Kongo-Central', 'Katanga'];
const villes = ['Toutes', 'Kinshasa', 'Goma', 'Bukavu', 'Lubumbashi', 'Matadi'];
const types = ['Tous', 'Hôtel', 'Auberge', 'Lieu'];

function HebergementCard({ hebergement }: { hebergement: Hebergement }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [nombreChambres, setNombreChambres] = useState(1);
  const [nombrePersonnes, setNombrePersonnes] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<'sur-place' | 'direct'>('sur-place');
  const [paymentType, setPaymentType] = useState<'mobile-money' | 'carte' | 'paypal'>('mobile-money');
  const [reservateurName, setReservateurName] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null);
  const [cinetpayTransactionId, setCinetpayTransactionId] = useState<string | null>(null);
  const [showCinetpayRedirect, setShowCinetpayRedirect] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [showPaypalRedirect, setShowPaypalRedirect] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const { toast } = useToast();

  // Défilement automatique de droite à gauche
  useEffect(() => {
    if (hebergement.images.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        if (prev >= hebergement.images.length - 1) {
          return 0; // Retour au début
        }
        return prev + 1; // Image suivante
      });
    }, 3000); // Change d'image toutes les 3 secondes

    return () => clearInterval(interval);
  }, [hebergement.images.length, isPaused]);

  // Récupérer le nom du réservateur depuis le localStorage si disponible
  useEffect(() => {
    const savedName = localStorage.getItem('reservateur_name');
    if (savedName) {
      setReservateurName(savedName);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) {
      setIsPaused(false);
      return;
    }
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && currentImageIndex < hebergement.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (distance < -minSwipeDistance && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
    
    // Reprendre le défilement automatique après un court délai
    setTimeout(() => setIsPaused(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hebergement.nom,
          text: hebergement.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Erreur de partage:', err);
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papiers",
      });
    }
  };

  const calculateTotal = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const nights = differenceInDays(dateRange.to, dateRange.from);
    return nights * hebergement.prixParJour * nombreChambres;
  };

  const generateInvoice = async (): Promise<{ invoiceNumber: string; invoiceId: string }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Couleurs
        const primaryColor = [255, 136, 0]; // #FF8800
        const darkColor = [0, 51, 102]; // #003366
        const textColor = [51, 51, 51];
        
        // Générer le numéro de facture
        const invoiceNumber = `FAC-${Date.now().toString().slice(-8)}`;
        const invoiceId = Date.now().toString();
        
        // URL de la facture en ligne
        const invoiceUrl = `${window.location.origin}/facture/${invoiceId}`;
        
        // En-tête avec logo (simulé)
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Ya Biso RDC', 20, 25);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Votre guide de voyage au Congo', 20, 32);
        
        // Titre de la facture
        doc.setTextColor(...textColor);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('FACTURE DE RÉSERVATION', pageWidth / 2, 60, { align: 'center' });
        
        // Informations de réservation
        let yPos = 80;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Détails de la réservation', 20, yPos);
        
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Réservateur: ${reservateurName || 'Non spécifié'}`, 20, yPos);
        yPos += 7;
        doc.text(`Hébergement: ${hebergement.nom}`, 20, yPos);
        yPos += 7;
        doc.text(`Adresse: ${hebergement.ville}, ${hebergement.province}`, 20, yPos);
        yPos += 7;
        if (dateRange?.from && dateRange?.to) {
          doc.text(`Dates: ${format(dateRange.from, "dd/MM/yyyy", { locale: fr })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: fr })}`, 20, yPos);
          yPos += 7;
          doc.text(`Nombre de nuits: ${nights}`, 20, yPos);
          yPos += 7;
        }
        doc.text(`Chambres: ${nombreChambres}`, 20, yPos);
        yPos += 7;
        doc.text(`Personnes: ${nombrePersonnes}`, 20, yPos);
        
        // Détails de paiement
        yPos += 15;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Détails de paiement', 20, yPos);
        
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const paymentMethodText = paymentMethod === 'sur-place' 
          ? 'Paiement sur place' 
          : paymentType === 'mobile-money' 
            ? 'Mobile Money' 
            : paymentType === 'paypal'
              ? 'PayPal'
              : 'Carte bancaire';
        doc.text(`Méthode: ${paymentMethodText}`, 20, yPos);
        
        // Tableau des prix
        yPos += 15;
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPos - 5, pageWidth - 40, 5, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.text('Description', 20, yPos);
        doc.text('Montant', pageWidth - 60, yPos, { align: 'right' });
        
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(`Prix par nuit (x${nombreChambres} chambre${nombreChambres > 1 ? 's' : ''})`, 20, yPos);
        doc.text(`$${hebergement.prixParJour * nombreChambres}`, pageWidth - 60, yPos, { align: 'right' });
        
        yPos += 7;
        doc.text(`x ${nights} nuit${nights > 1 ? 's' : ''}`, 30, yPos);
        
        yPos += 10;
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, yPos, pageWidth - 20, yPos);
        
        yPos += 8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text('TOTAL', 20, yPos);
        doc.text(`$${totalPrice}`, pageWidth - 60, yPos, { align: 'right' });
    
        // QR Code
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(invoiceUrl, {
            width: 50,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          // Ajouter le QR code en bas à droite
          const qrSize = 40;
          const qrX = pageWidth - 60;
          const qrY = pageHeight - 60;
          
          doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
          
          // Texte sous le QR code
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          doc.text('Scannez pour voir', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center' });
          doc.text('la facture en ligne', qrX + qrSize / 2, qrY + qrSize + 10, { align: 'center' });
        } catch (error) {
          console.error('Erreur lors de la génération du QR code:', error);
        }
        
        // Numéro de facture et date
        yPos = pageHeight - 40;
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`N° de facture: ${invoiceNumber}`, 20, yPos);
        doc.text(`Date: ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}`, 20, yPos + 7);
        
        // Pied de page
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Merci pour votre confiance !', pageWidth / 2, pageHeight - 15, { align: 'center' });
        doc.text('Ya Biso RDC - Votre guide de voyage au Congo', pageWidth / 2, pageHeight - 10, { align: 'center' });
        
        // Sauvegarder les données de la facture dans le localStorage pour la page en ligne
        const invoiceData = {
          id: invoiceId,
          invoiceNumber,
          hebergement: {
            nom: hebergement.nom,
            ville: hebergement.ville,
            province: hebergement.province,
          },
          dates: dateRange?.from && dateRange?.to ? {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
          } : null,
          nights,
          nombreChambres,
          nombrePersonnes,
          prixParJour: hebergement.prixParJour,
          totalPrice,
          reservateurName: reservateurName || 'Non spécifié',
          paymentMethod: paymentMethod === 'sur-place' 
            ? 'Paiement sur place' 
            : paymentType === 'mobile-money' 
              ? 'Mobile Money' 
              : paymentType === 'paypal'
                ? 'PayPal'
                : 'Carte bancaire',
          date: new Date().toISOString(),
        };
        
        localStorage.setItem(`invoice_${invoiceId}`, JSON.stringify(invoiceData));
        
        // Télécharger le PDF avec un petit délai pour s'assurer que tout est prêt
        const fileName = `Facture_${hebergement.nom.replace(/\s+/g, '_')}_${invoiceNumber}.pdf`;
        
        // Télécharger le PDF - utiliser la méthode blob pour plus de fiabilité
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // Déclencher le téléchargement
        link.click();
        
        // Nettoyer après un court délai
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('✅ Facture téléchargée:', fileName);
        }, 100);
        
        resolve({ invoiceNumber, invoiceId });
      } catch (error) {
        console.error('Erreur lors de la génération de la facture:', error);
        reject(error);
      }
    });
  };

  const handleReservation = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Dates requises",
        description: "Veuillez sélectionner vos dates d'arrivée et de départ",
        variant: "destructive",
      });
      return;
    }

    // Si paiement sur place, générer directement la facture
    if (paymentMethod === 'sur-place') {
      setIsSubmitting(true);
      try {
        const { invoiceNumber, invoiceId } = await generateInvoice();
        setLastInvoiceId(invoiceId);
        // Attendre un peu pour que le téléchargement se déclenche
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSubmitting(false);
        setShowBooking(false);
        setShowConfirmation(true);
        toast({
          title: "✅ Facture téléchargée",
          description: `La facture ${invoiceNumber} a été téléchargée. Vérifiez vos téléchargements.`,
          duration: 5000,
        });
      } catch (error) {
        console.error('Erreur:', error);
        setIsSubmitting(false);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la génération de la facture",
          variant: "destructive",
        });
      }
      return;
    }

    // Si paiement direct, afficher le formulaire de paiement
    setShowPayment(true);
  };

  const handlePayment = async () => {
    if (paymentType === 'mobile-money' && !mobileMoneyNumber) {
      toast({
        title: "Numéro requis",
        description: "Veuillez entrer votre numéro Mobile Money",
        variant: "destructive",
      });
      return;
    }

    if (paymentType === 'carte') {
      if (!cardNumber || !cardExpiry || !cardCVV || !cardName) {
        toast({
          title: "Informations requises",
          description: "Veuillez remplir tous les champs de la carte",
          variant: "destructive",
        });
        return;
      }
    }

    if (paymentType === 'paypal') {
      setIsProcessingPayment(true);
      setShowPaypalRedirect(true);

      try {
        // Générer une référence unique pour le paiement
        const paymentReference = `RES${Date.now()}${hebergement.id.replace(/[^a-zA-Z0-9]/g, '')}`;
        
        console.log('🚀 Création de la commande PayPal...', {
          amount: totalPrice,
          currency: 'USD',
          description: `Réservation - ${hebergement.nom}`,
        });
        
        // Créer la commande PayPal
        const paypalResponse = await createPayPalPayment({
          amount: totalPrice,
          currency: 'USD',
          description: `Réservation - ${hebergement.nom}`,
          reference: paymentReference,
          customerName: reservateurName || 'Client',
          customerEmail: undefined,
          returnUrl: `${window.location.origin}/api/paypal/return`,
          cancelUrl: `${window.location.origin}/api/paypal/cancel`,
        });

        console.log('📦 Réponse PayPal reçue:', {
          success: paypalResponse.success,
          orderId: paypalResponse.orderId,
          hasPaymentUrl: !!paypalResponse.paymentUrl,
          paymentUrlLength: paypalResponse.paymentUrl?.length || 0,
          message: paypalResponse.message,
        });

        if (!paypalResponse.success) {
          console.error('❌ Erreur PayPal détaillée:', {
            message: paypalResponse.message,
            details: paypalResponse.details,
            fullResponse: paypalResponse,
          });
          
          const errorMsg = paypalResponse.message || 'Erreur lors de la création du paiement PayPal';
          throw new Error(errorMsg);
        }

        setPaypalOrderId(paypalResponse.orderId || null);

        // Vérifier si nous avons une URL de paiement valide
        if (!paypalResponse.paymentUrl || paypalResponse.paymentUrl === '#') {
          console.error('❌ URL PayPal manquante ou invalide:', paypalResponse);
          throw new Error('URL de paiement PayPal manquante. Vérifiez la configuration PayPal dans .env.local');
        }

        if (paypalResponse.paymentUrl.length < 10) {
          console.error('❌ URL PayPal trop courte:', paypalResponse.paymentUrl);
          throw new Error('URL de paiement PayPal invalide');
        }

        // Sauvegarder l'orderId dans le localStorage pour vérification après retour
        if (paypalResponse.orderId) {
          localStorage.setItem('paypal_order_id', paypalResponse.orderId);
          localStorage.setItem('paypal_payment_reference', paymentReference);
          console.log('💾 Données PayPal sauvegardées dans localStorage:', {
            orderId: paypalResponse.orderId,
            reference: paymentReference,
          });
        }
        
        console.log('✅ URL PayPal valide, redirection en cours...', {
          url: paypalResponse.paymentUrl.substring(0, 60) + '...',
        });
        
        // Utiliser la fonction openPayPalPaymentPage pour la redirection
        // Elle utilisera window.location.href pour une redirection directe
        openPayPalPaymentPage(paypalResponse.paymentUrl);
        
        // La redirection va quitter cette page immédiatement
        return;
        
      } catch (error: any) {
        console.error('❌ Erreur paiement PayPal:', error);
        setIsProcessingPayment(false);
        setShowPaypalRedirect(false);
        toast({
          title: "Erreur de paiement PayPal",
          description: error.message || "Une erreur est survenue lors du traitement du paiement PayPal. Vérifiez les variables d'environnement PayPal.",
          variant: "destructive",
          duration: 8000,
        });
      }
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Générer une référence unique pour le paiement (sans caractères spéciaux)
      const paymentReference = `RES${Date.now()}${hebergement.id.replace(/[^a-zA-Z0-9]/g, '')}`;
      
      // Créer le paiement via Cinetpay
      // Le compte accepte CDF et USD (selon l'erreur Cinetpay)
      const cinetpayResponse = await createCinetpayPayment({
        amount: totalPrice,
        currency: 'USD', // USD accepté par le compte Cinetpay (ou CDF pour la devise locale)
        customerPhoneNumber: paymentType === 'mobile-money' ? mobileMoneyNumber : '+243000000000',
        customerEmail: undefined, // Vous pouvez ajouter un champ email si nécessaire
        customerName: cardName || 'Client',
        description: `Réservation - ${hebergement.nom}`,
        reference: paymentReference,
        returnUrl: `${window.location.origin}/api/cinetpay/return`,
        notifyUrl: `${window.location.origin}/api/cinetpay/notify`,
      });

      if (!cinetpayResponse.success) {
        // Afficher les détails de l'erreur pour le débogage
        console.error('❌ Erreur Cinetpay détaillée:', {
          message: cinetpayResponse.message,
          details: cinetpayResponse.details,
          fullResponse: cinetpayResponse,
        });
        
        const errorMsg = cinetpayResponse.message || 'Erreur lors de la création du paiement';
        const detailsMsg = cinetpayResponse.details 
          ? `\nDétails: ${JSON.stringify(cinetpayResponse.details, null, 2)}`
          : '';
        
        throw new Error(`${errorMsg}${detailsMsg}`);
      }

      setCinetpayTransactionId(cinetpayResponse.transactionId || null);

      // Si Cinetpay retourne une URL de paiement, ouvrir la page
      if (cinetpayResponse.paymentUrl && cinetpayResponse.paymentUrl !== '#') {
        setIsProcessingPayment(false);
        setShowCinetpayRedirect(true);
        openCinetpayPaymentPage(cinetpayResponse.paymentUrl);
        
        // Vérifier périodiquement le statut du paiement
        const checkInterval = setInterval(async () => {
          if (cinetpayResponse.transactionId) {
            const status = await checkCinetpayPaymentStatus(cinetpayResponse.transactionId);
            if (status && status.status === 'ACCEPTED') {
              clearInterval(checkInterval);
              handlePaymentSuccess(paymentReference);
            } else if (status && (status.status === 'REFUSED' || status.status === 'CANCELLED')) {
              clearInterval(checkInterval);
              setIsProcessingPayment(false);
              setShowCinetpayRedirect(false);
              toast({
                title: "Paiement échoué",
                description: "Le paiement n'a pas pu être effectué",
                variant: "destructive",
              });
            }
          }
        }, 3000); // Vérifier toutes les 3 secondes

        // Arrêter la vérification après 5 minutes
        setTimeout(() => clearInterval(checkInterval), 300000);
        
        return;
      }

      // Si pas d'URL de paiement (mode simulation), procéder directement
      await new Promise(resolve => setTimeout(resolve, 2000));
      handlePaymentSuccess(paymentReference);
      
    } catch (error: any) {
      console.error('Erreur paiement:', error);
      setIsProcessingPayment(false);
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue lors du traitement du paiement",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async (paymentReference: string) => {
    setIsProcessingPayment(false);
    setShowPayment(false);
    setShowBooking(false);
    setShowCinetpayRedirect(false);
    setShowPaypalRedirect(false);
    
    // Générer la facture
    try {
      const { invoiceNumber, invoiceId } = await generateInvoice();
      setLastInvoiceId(invoiceId);
      // Attendre un peu pour que le téléchargement se déclenche
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setShowConfirmation(true);
      toast({
        title: "✅ Paiement réussi - Facture téléchargée",
        description: `La facture ${invoiceNumber} a été téléchargée. Vérifiez vos téléchargements.`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de la facture",
        variant: "destructive",
      });
    }
  };

  const nights = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) 
    : 0;
  const totalPrice = calculateTotal();

  return (
    <Card className="bg-gray-900/50 border-gray-800 overflow-hidden mb-4">
      {/* Carrousel d'images style Instagram */}
      <div 
        className="relative aspect-[4/3] w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {hebergement.images.map((image, index) => (
            <div key={index} className="min-w-full h-full relative">
              <Image
                src={image}
                alt={`${hebergement.nom} - Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Indicateurs de pagination */}
        {hebergement.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
            {hebergement.images.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  currentImageIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        )}

        {/* Bouton favori */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm hover:bg-black/50"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart 
            className={cn(
              "h-5 w-5 transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "text-white"
            )} 
          />
        </Button>
      </div>

      <CardContent className="p-4">
        {/* En-tête avec nom et prix */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{hebergement.nom}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <MapPin className="h-4 w-4" />
              <span>{hebergement.ville}, {hebergement.province}</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-4 w-4 text-[#FFCC00]" fill="#FFCC00" />
              <span className="text-sm text-white font-semibold">{hebergement.rating}</span>
              <span className="text-sm text-gray-400">({hebergement.nombreAvis})</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#FF8800]">
              ${hebergement.prixParJour}
            </div>
            <div className="text-xs text-gray-400">par jour</div>
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-4 line-clamp-2">{hebergement.description}</p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-gray-600 bg-gray-800/50 text-white hover:bg-gray-700 hover:border-gray-500"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
            onClick={() => setShowBooking(true)}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Réserver
          </Button>
        </div>
      </CardContent>

      {/* Modal de réservation */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{hebergement.nom}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {hebergement.ville}, {hebergement.province}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Nom du réservateur */}
            <div>
              <Label className="text-white mb-2 block">Nom du réservateur *</Label>
              <Input
                type="text"
                placeholder="Votre nom complet"
                value={reservateurName}
                onChange={(e) => {
                  setReservateurName(e.target.value);
                  // Sauvegarder dans le localStorage pour les prochaines fois
                  localStorage.setItem('reservateur_name', e.target.value);
                }}
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Ce nom apparaîtra sur la facture</p>
            </div>

            {/* Sélection de dates */}
            <div>
              <Label className="text-white mb-2 block">Dates de séjour</Label>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
                className="rounded-md border border-gray-700 bg-gray-800"
                classNames={{
                  months: "flex flex-col",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center text-white",
                  caption_label: "text-sm font-medium text-white",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border-gray-600",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-gray-700",
                  day_range_end: "day-range-end",
                  day_selected: "bg-[#FF8800] text-white hover:bg-[#FF8800]/90 focus:bg-[#FF8800] focus:text-white",
                  day_today: "bg-gray-700 text-white",
                  day_outside: "day-outside text-gray-500",
                  day_disabled: "text-gray-600 opacity-50",
                  day_range_middle: "aria-selected:bg-[#FF8800]/50 aria-selected:text-white",
                }}
              />
              {dateRange?.from && dateRange?.to && (
                <div className="mt-2 text-sm text-gray-300">
                  <p>
                    {format(dateRange.from, "PPP", { locale: fr })} - {format(dateRange.to, "PPP", { locale: fr })}
                  </p>
                  <p className="text-[#FF8800] font-semibold">{nights} nuit{nights > 1 ? 's' : ''}</p>
                </div>
              )}
            </div>

            {/* Nombre de chambres */}
            <div>
              <Label className="text-white mb-2 flex items-center gap-2">
                <Bed className="h-4 w-4" />
                Nombre de chambres
              </Label>
              <Select value={nombreChambres.toString()} onValueChange={(value) => setNombreChambres(Number(value))}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()} className="text-white">
                      {num} chambre{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nombre de personnes */}
            <div>
              <Label className="text-white mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Nombre de personnes
              </Label>
              <Select value={nombrePersonnes.toString()} onValueChange={(value) => setNombrePersonnes(Number(value))}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()} className="text-white">
                      {num} personne{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Résumé du prix */}
            {dateRange?.from && dateRange?.to && (
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 border border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Prix par nuit</span>
                  <span className="text-white">${hebergement.prixParJour}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Nombre de nuits</span>
                  <span className="text-white">{nights}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Nombre de chambres</span>
                  <span className="text-white">{nombreChambres}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-[#FF8800]">${totalPrice}</span>
                </div>
              </div>
            )}

            {/* Choix de méthode de paiement */}
            <div>
              <Label className="text-white mb-3 block text-base font-semibold">Méthode de paiement</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'sur-place' | 'direct')}>
                <div className="space-y-3">
                  <div 
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      paymentMethod === 'sur-place' 
                        ? "border-[#FF8800] bg-[#FF8800]/10" 
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                    )}
                    onClick={() => setPaymentMethod('sur-place')}
                  >
                    <RadioGroupItem value="sur-place" id="sur-place" className="text-[#FF8800]" />
                    <Label htmlFor="sur-place" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-[#FF8800]" />
                      <div>
                        <div className="text-white font-medium">Payer sur place</div>
                        <div className="text-sm text-gray-400">Vous paierez à l'arrivée</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div 
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      paymentMethod === 'direct' 
                        ? "border-[#FF8800] bg-[#FF8800]/10" 
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                    )}
                    onClick={() => setPaymentMethod('direct')}
                  >
                    <RadioGroupItem value="direct" id="direct" className="text-[#FF8800]" />
                    <Label htmlFor="direct" className="flex-1 cursor-pointer flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-[#FF8800]" />
                      <div>
                        <div className="text-white font-medium">Payer maintenant</div>
                        <div className="text-sm text-gray-400">Paiement sécurisé en ligne</div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Bouton de réservation */}
            <Button
              className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white h-12 text-lg font-semibold"
              onClick={handleReservation}
              disabled={!dateRange?.from || !dateRange?.to || !reservateurName || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  {paymentMethod === 'sur-place' ? 'Confirmer la réservation' : 'Procéder au paiement'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de paiement */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {paymentType === 'paypal' ? 'Paiement via PayPal' : 'Paiement via Cinetpay'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Montant à payer: <span className="text-[#FF8800] font-bold text-lg">${totalPrice}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Choix du type de paiement */}
            <div>
              <Label className="text-white mb-3 block text-base font-semibold">Mode de paiement</Label>
              <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as 'mobile-money' | 'carte' | 'paypal')}>
                <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
                  <TabsTrigger value="mobile-money" className="data-[state=active]:bg-[#FF8800] data-[state=active]:text-white text-xs">
                    <Smartphone className="h-4 w-4 mr-1" />
                    Mobile Money
                  </TabsTrigger>
                  <TabsTrigger value="carte" className="data-[state=active]:bg-[#FF8800] data-[state=active]:text-white text-xs">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Carte
                  </TabsTrigger>
                  <TabsTrigger value="paypal" className="data-[state=active]:bg-[#FF8800] data-[state=active]:text-white text-xs">
                    <CreditCard className="h-4 w-4 mr-1" />
                    PayPal
                  </TabsTrigger>
                </TabsList>

                {/* Formulaire Mobile Money */}
                <TabsContent value="mobile-money" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-white mb-2 block">Numéro Mobile Money</Label>
                    <Input
                      type="tel"
                      placeholder="+243 XXX XXX XXX"
                      value={mobileMoneyNumber}
                      onChange={(e) => setMobileMoneyNumber(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">Orange Money, M-Pesa, Airtel Money - Paiement sécurisé via Cinetpay</p>
                  </div>
                </TabsContent>

                {/* Formulaire Carte */}
                <TabsContent value="carte" className="space-y-4 mt-4">
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-400">
                      💡 Les champs se rempliront automatiquement avec les données enregistrées dans votre navigateur. Autorisez l'autocomplétion si demandé.
                    </p>
                  </div>
                  <div>
                    <Label className="text-white mb-2 block">Nom sur la carte</Label>
                    <Input
                      type="text"
                      placeholder="Jean Dupont"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      autoComplete="cc-name"
                      name="cc-name"
                    />
                  </div>
                  <div>
                    <Label className="text-white mb-2 block">Numéro de carte</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                      maxLength={19}
                      className="bg-gray-800 border-gray-700 text-white"
                      autoComplete="cc-number"
                      name="cc-number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white mb-2 block">Date d'expiration</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setCardExpiry(value);
                        }}
                        maxLength={5}
                        className="bg-gray-800 border-gray-700 text-white"
                        autoComplete="cc-exp"
                        name="cc-exp"
                      />
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">CVV</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="123"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        maxLength={3}
                        className="bg-gray-800 border-gray-700 text-white"
                        autoComplete="cc-csc"
                        name="cc-csc"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Formulaire PayPal */}
                <TabsContent value="paypal" className="space-y-4 mt-4">
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-center">
                    <CreditCard className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-white font-semibold mb-2">Paiement via PayPal</p>
                    <p className="text-xs text-gray-300 mb-4">
                      Vous serez redirigé vers PayPal pour compléter votre paiement de manière sécurisée.
                    </p>
                    <p className="text-sm text-[#FF8800] font-semibold">Montant: ${totalPrice}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Bouton de paiement */}
            <Button
              className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white h-12 text-lg font-semibold"
              onClick={handlePayment}
              disabled={isProcessingPayment || showCinetpayRedirect || showPaypalRedirect}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Initialisation du paiement...
                </>
              ) : showCinetpayRedirect ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Redirection vers Cinetpay...
                </>
              ) : showPaypalRedirect ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Redirection vers PayPal...
                </>
              ) : (
                <>
                  {paymentType === 'paypal' 
                    ? `Payer ${totalPrice} via PayPal`
                    : `Payer ${totalPrice} via Cinetpay`}
                </>
              )}
            </Button>

            {showCinetpayRedirect && (
              <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <p className="text-sm text-blue-400 mb-2">
                  <strong>Redirection en cours...</strong>
                </p>
                <p className="text-xs text-gray-300">
                  Vous allez être redirigé vers la page de paiement Cinetpay. 
                  Si la redirection ne fonctionne pas, vérifiez que les pop-ups ne sont pas bloqués.
                </p>
              </div>
            )}

            {showPaypalRedirect && (
              <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <p className="text-sm text-blue-400 mb-2">
                  <strong>Redirection en cours...</strong>
                </p>
                <p className="text-xs text-gray-300">
                  Vous allez être redirigé vers la page de paiement PayPal. 
                  Si la redirection ne fonctionne pas, vérifiez que les pop-ups ne sont pas bloqués.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation de réservation */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#FF8800] flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-400" />
              Réservation confirmée !
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Votre réservation a été effectuée avec succès
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h3 className="font-semibold text-white mb-2">{hebergement.nom}</h3>
              <p className="text-sm text-gray-300 mb-2">{hebergement.ville}, {hebergement.province}</p>
              {dateRange?.from && dateRange?.to && (
                <>
                  <p className="text-sm text-gray-300">
                    {format(dateRange.from, "PPP", { locale: fr })} - {format(dateRange.to, "PPP", { locale: fr })}
                  </p>
                  <p className="text-sm text-gray-300">{nights} nuit{nights > 1 ? 's' : ''} • {nombreChambres} chambre{nombreChambres > 1 ? 's' : ''} • {nombrePersonnes} personne{nombrePersonnes > 1 ? 's' : ''}</p>
                  <p className="text-lg font-bold text-[#FF8800] mt-2">Total: ${totalPrice}</p>
                </>
              )}
            </div>

            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-start gap-3">
              <Download className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-400 mb-1">Facture téléchargée</p>
                <p className="text-xs text-gray-300 mb-3">
                  Votre facture PDF a été téléchargée automatiquement. Vérifiez votre dossier de téléchargements.
                </p>
                {lastInvoiceId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-green-500/50 text-green-400 hover:bg-green-500/20"
                    onClick={async () => {
                      try {
                        await generateInvoice();
                        toast({
                          title: "Téléchargement",
                          description: "La facture est en cours de téléchargement",
                        });
                      } catch (error) {
                        toast({
                          title: "Erreur",
                          description: "Impossible de télécharger la facture",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger à nouveau
                  </Button>
                )}
              </div>
            </div>

            {lastInvoiceId && (
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Voir la facture en ligne :</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-[#FF8800] hover:bg-gray-700"
                  onClick={() => {
                    window.open(`/facture/${lastInvoiceId}`, '_blank');
                  }}
                >
                  Ouvrir la facture en ligne
                </Button>
              </div>
            )}

            <p className="text-sm text-gray-400">
              Un email de confirmation vous sera envoyé sous peu avec tous les détails de votre réservation.
            </p>

            <Button
              className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
              onClick={() => {
                setShowConfirmation(false);
                setDateRange(undefined);
                setNombreChambres(1);
                setNombrePersonnes(2);
                setPaymentMethod('sur-place');
                setLastInvoiceId(null);
              }}
            >
              Parfait
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function HebergementPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    type: 'Tous',
    ville: 'Toutes',
    province: 'Toutes',
    prixMin: '',
    prixMax: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredHebergements = hebergements.filter((hebergement) => {
    if (filters.type !== 'Tous') {
      const typeMap: Record<string, string> = {
        'Hôtel': 'hotel',
        'Auberge': 'auberge',
        'Lieu': 'lieu',
      };
      if (hebergement.type !== typeMap[filters.type]) return false;
    }
    if (filters.ville !== 'Toutes' && hebergement.ville !== filters.ville) return false;
    if (filters.province !== 'Toutes' && hebergement.province !== filters.province) return false;
    if (filters.prixMin && hebergement.prixParJour < Number(filters.prixMin)) return false;
    if (filters.prixMax && hebergement.prixParJour > Number(filters.prixMax)) return false;
    return true;
  });

  const hasActiveFilters = filters.type !== 'Tous' || 
    filters.ville !== 'Toutes' || 
    filters.province !== 'Toutes' || 
    filters.prixMin !== '' || 
    filters.prixMax !== '';

  const clearFilters = () => {
    setFilters({
      type: 'Tous',
      ville: 'Toutes',
      province: 'Toutes',
      prixMin: '',
      prixMax: '',
    });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-white hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FF8800]/20">
                  <Hotel className="h-6 w-6 text-[#FF8800]" />
                </div>
                <h1 className="text-xl font-bold text-white">Hébergement</h1>
              </div>
            </div>
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-gray-800 relative"
                >
                  <Filter className="h-5 w-5" />
                  {hasActiveFilters && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-[#FF8800] rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] bg-gray-900 border-t border-gray-800">
                <SheetHeader>
                  <SheetTitle className="text-white flex items-center justify-between">
                    <span>Filtres</span>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-[#FF8800] hover:text-[#FF8800]/80"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Réinitialiser
                      </Button>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Type</label>
                    <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {types.map((type) => (
                          <SelectItem key={type} value={type} className="text-white">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Province</label>
                    <Select value={filters.province} onValueChange={(value) => setFilters({...filters, province: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province} className="text-white">
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Ville</label>
                    <Select value={filters.ville} onValueChange={(value) => setFilters({...filters, ville: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {villes.map((ville) => (
                          <SelectItem key={ville} value={ville} className="text-white">
                            {ville}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Prix min ($)</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.prixMin}
                        onChange={(e) => setFilters({...filters, prixMin: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Prix max ($)</label>
                      <Input
                        type="number"
                        placeholder="500"
                        value={filters.prixMax}
                        onChange={(e) => setFilters({...filters, prixMax: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white mt-6"
                    onClick={() => setShowFilters(false)}
                  >
                    Appliquer les filtres
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-24 pb-32">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {filteredHebergements.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-white text-center">
                <p className="text-lg mb-2">Aucun hébergement trouvé</p>
                <p className="text-sm text-gray-400">Essayez de modifier vos filtres</p>
              </div>
            </div>
          ) : (
            filteredHebergements.map((hebergement) => (
              <HebergementCard key={hebergement.id} hebergement={hebergement} />
            ))
          )}
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
