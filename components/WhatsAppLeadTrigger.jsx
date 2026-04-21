'use client';

import { useState, useEffect } from 'react';
import WhatsAppLeadModal from './WhatsAppLeadModal';

export default function WhatsAppLeadTrigger({ 
  children, 
  propertyId, 
  propertyTitle, 
  className = "" 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [whatsapp, setWhatsapp] = useState('250788661932');

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.json())
      .then(data => {
        if (data.contact?.whatsapp) {
          setWhatsapp(data.contact.whatsapp.replace(/\D/g, ''));
        }
      });
  }, []);

  return (
    <>
      <div onClick={() => setIsModalOpen(true)} className={`${className} cursor-pointer`}>
        {children}
      </div>

      <WhatsAppLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        whatsappNumber={whatsapp}
      />
    </>
  );
}
