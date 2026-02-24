'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  reservateurName?: string;
  hebergement: {
    nom: string;
    ville: string;
    province: string;
  };
  dates: {
    from: string;
    to: string;
  } | null;
  nights: number;
  nombreChambres: number;
  nombrePersonnes: number;
  prixParJour: number;
  totalPrice: number;
  paymentMethod: string;
  date: string;
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const invoiceId = params.id as string;
    const storedData = localStorage.getItem(`invoice_${invoiceId}`);
    
    if (storedData) {
      const data = JSON.parse(storedData);
      setInvoiceData(data);
      
      // Générer le QR code
      const invoiceUrl = window.location.href;
      QRCode.toDataURL(invoiceUrl, {
        width: 128,
        margin: 1,
      }).then(url => {
        setQrCodeUrl(url);
      }).catch(err => {
        console.error('Erreur génération QR code:', err);
      });
    }
    setLoading(false);
  }, [params.id]);

  const downloadInvoice = async () => {
    if (!invoiceData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const primaryColor = [255, 136, 0];
    const textColor = [51, 51, 51];
    
    const invoiceUrl = `${window.location.origin}/facture/${invoiceData.id}`;
    
    // En-tête
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Ya Biso RDC', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Votre guide de voyage au Congo', 20, 32);
    
    // Titre
    doc.setTextColor(...textColor);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE DE RÉSERVATION', pageWidth / 2, 60, { align: 'center' });
    
    // Détails
    let yPos = 80;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Détails de la réservation', 20, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (invoiceData.reservateurName) {
      doc.text(`Réservateur: ${invoiceData.reservateurName}`, 20, yPos);
      yPos += 7;
    }
    doc.text(`Hébergement: ${invoiceData.hebergement.nom}`, 20, yPos);
    yPos += 7;
    doc.text(`Adresse: ${invoiceData.hebergement.ville}, ${invoiceData.hebergement.province}`, 20, yPos);
    
    if (invoiceData.dates) {
      yPos += 7;
      const fromDate = new Date(invoiceData.dates.from);
      const toDate = new Date(invoiceData.dates.to);
      doc.text(`Dates: ${format(fromDate, "dd/MM/yyyy", { locale: fr })} - ${format(toDate, "dd/MM/yyyy", { locale: fr })}`, 20, yPos);
      yPos += 7;
      doc.text(`Nombre de nuits: ${invoiceData.nights}`, 20, yPos);
      yPos += 7;
    }
    doc.text(`Chambres: ${invoiceData.nombreChambres}`, 20, yPos);
    yPos += 7;
    doc.text(`Personnes: ${invoiceData.nombrePersonnes}`, 20, yPos);
    
    // Paiement
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Détails de paiement', 20, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Méthode: ${invoiceData.paymentMethod}`, 20, yPos);
    
    // Prix
    yPos += 15;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos - 5, pageWidth - 40, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, yPos);
    doc.text('Montant', pageWidth - 60, yPos, { align: 'right' });
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Prix par nuit (x${invoiceData.nombreChambres} chambre${invoiceData.nombreChambres > 1 ? 's' : ''})`, 20, yPos);
    doc.text(`$${invoiceData.prixParJour * invoiceData.nombreChambres}`, pageWidth - 60, yPos, { align: 'right' });
    
    yPos += 7;
    doc.text(`x ${invoiceData.nights} nuit${invoiceData.nights > 1 ? 's' : ''}`, 30, yPos);
    
    yPos += 10;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('TOTAL', 20, yPos);
    doc.text(`$${invoiceData.totalPrice}`, pageWidth - 60, yPos, { align: 'right' });
    
    // QR Code
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(invoiceUrl, {
        width: 50,
        margin: 1,
      });
      const qrSize = 40;
      const qrX = pageWidth - 60;
      const qrY = pageHeight - 60;
      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text('Scannez pour voir', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center' });
      doc.text('la facture en ligne', qrX + qrSize / 2, qrY + qrSize + 10, { align: 'center' });
    } catch (error) {
      console.error('Erreur QR code:', error);
    }
    
    // Numéro et date
    yPos = pageHeight - 40;
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`N° de facture: ${invoiceData.invoiceNumber}`, 20, yPos);
    const invoiceDate = new Date(invoiceData.date);
    doc.text(`Date: ${format(invoiceDate, "dd/MM/yyyy à HH:mm", { locale: fr })}`, 20, yPos + 7);
    
    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Merci pour votre confiance !', pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text('Ya Biso RDC - Votre guide de voyage au Congo', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    const fileName = `Facture_${invoiceData.hebergement.nom.replace(/\s+/g, '_')}_${invoiceData.invoiceNumber}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg mb-4">Facture introuvable</p>
          <Button onClick={() => router.push('/home')} className="bg-[#FF8800] hover:bg-[#FF8800]/90">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </Button>
          <Button
            onClick={downloadInvoice}
            className="bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>

        {/* Facture */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
          {/* En-tête */}
          <div className="bg-[#FF8800] rounded-t-lg -m-8 mb-8 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Ya Biso RDC</h1>
            <p className="text-sm opacity-90">Votre guide de voyage au Congo</p>
          </div>

          <h2 className="text-2xl font-bold text-center mb-8">FACTURE DE RÉSERVATION</h2>

          {/* Détails */}
          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-[#FF8800]">Détails de la réservation</h3>
              <div className="space-y-2 text-gray-300">
                {invoiceData.reservateurName && (
                  <p><span className="font-medium text-white">Réservateur:</span> {invoiceData.reservateurName}</p>
                )}
                <p><span className="font-medium text-white">Hébergement:</span> {invoiceData.hebergement.nom}</p>
                <p><span className="font-medium text-white">Adresse:</span> {invoiceData.hebergement.ville}, {invoiceData.hebergement.province}</p>
                {invoiceData.dates && (
                  <>
                    <p><span className="font-medium text-white">Dates:</span> {format(new Date(invoiceData.dates.from), "PPP", { locale: fr })} - {format(new Date(invoiceData.dates.to), "PPP", { locale: fr })}</p>
                    <p><span className="font-medium text-white">Nombre de nuits:</span> {invoiceData.nights}</p>
                  </>
                )}
                <p><span className="font-medium text-white">Chambres:</span> {invoiceData.nombreChambres}</p>
                <p><span className="font-medium text-white">Personnes:</span> {invoiceData.nombrePersonnes}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-[#FF8800]">Détails de paiement</h3>
              <p className="text-gray-300"><span className="font-medium text-white">Méthode:</span> {invoiceData.paymentMethod}</p>
            </div>

            {/* Tableau des prix */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                <span className="font-semibold">Description</span>
                <span className="font-semibold">Montant</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Prix par nuit (x{invoiceData.nombreChambres} chambre{invoiceData.nombreChambres > 1 ? 's' : ''})</span>
                  <span className="text-white">${invoiceData.prixParJour * invoiceData.nombreChambres}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 pl-4">
                  <span>x {invoiceData.nights} nuit{invoiceData.nights > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-700">
                  <span className="text-xl font-bold text-white">TOTAL</span>
                  <span className="text-3xl font-bold text-[#FF8800]">${invoiceData.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center items-center gap-8 mt-8 pt-8 border-t border-gray-700">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block mb-2">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-gray-400">Chargement...</div>
                )}
              </div>
              <p className="text-xs text-gray-400">Scannez pour partager cette facture</p>
            </div>
          </div>

          {/* Informations de facture */}
          <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-gray-400">
            <p><span className="font-medium text-white">N° de facture:</span> {invoiceData.invoiceNumber}</p>
            <p><span className="font-medium text-white">Date:</span> {format(new Date(invoiceData.date), "PPP 'à' HH:mm", { locale: fr })}</p>
          </div>

          {/* Statut */}
          <div className="mt-6 flex items-center gap-2 text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Réservation confirmée</span>
          </div>
        </div>

        {/* Pied de page */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Merci pour votre confiance !</p>
          <p>Ya Biso RDC - Votre guide de voyage au Congo</p>
        </div>
      </div>
    </div>
  );
}

