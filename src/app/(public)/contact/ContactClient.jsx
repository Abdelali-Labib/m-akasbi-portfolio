"use client";

import React, { useState, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import {
  FaUserTie,
  FaComments,
  FaRocket,
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import HeroSection from "@/components/ui/HeroSection";
import AnimatedItem from "@/components/ui/AnimatedItem";

const ContactClient = ({ contactInfo }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { ref: contactInfoRef, inView: contactInfoInView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
    rootMargin: '-50px 0px',
  });
  const { ref: formRef, inView: formInView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
    rootMargin: '-50px 0px',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFeedbackMessage({
          type: "success",
          text: "Message envoyé avec succès!",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const result = await response.json();
        setFeedbackMessage({
          type: "error",
          text: result.error || "Une erreur est survenue. Merci de réessayer.",
        });
      }
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Une erreur de connexion est survenue. Merci de réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (type, name, label, isTextArea = false) => (
    <div className="group relative">
      {isTextArea ? (
        <textarea
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className="peer w-full resize-none rounded-xl border-2 border-accent/20 bg-light/50 px-4 py-4 text-sm text-primary shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-accent/40 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20 dark:bg-primary/50 dark:text-light"
          rows="5"
          required
          aria-label={label}
          autoComplete={name}
          placeholder=" "
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className="peer w-full rounded-xl border-2 border-accent/20 bg-light/50 px-4 py-4 text-sm text-primary shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-accent/40 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20 dark:bg-primary/50 dark:text-light"
          required
          aria-label={label}
          autoComplete={name}
          placeholder=" "
        />
      )}
      <label
        htmlFor={name}
        className={`absolute left-4 ${formData[name] ? "-top-2.5" : "top-4"} origin-left transform cursor-text px-2 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-accent ${formData[name] ? "text-xs text-accent" : "text-primary/60 dark:text-light/60"} bg-light dark:bg-primary`}
      >
        {label}
      </label>
    </div>
  );

  const ContactInfoCard = React.memo(({ icon: Icon, title, value, href, delay = 0 }) => (
    <div
      className={`group relative rounded-2xl border-2 border-accent/20 bg-gradient-to-br from-light/80 to-light/60 p-6 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-accent/40 hover:shadow-2xl dark:from-primary/80 dark:to-primary/60 ${contactInfoInView ? "animate-fade-in" : "opacity-0"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex items-center gap-4">
        <div className="rounded-xl bg-gradient-to-br from-accent to-accent/80 p-3 text-light shadow-lg transition-all duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary dark:text-light">{title}</h3>
          {href ? (
            <a href={href} className="text-sm text-accent transition-colors duration-300 hover:text-accent/80">
              {value}
            </a>
          ) : (
            <p className="text-sm text-primary/80 dark:text-light/80">{value}</p>
          )}
        </div>
      </div>
    </div>
  ));

  return (
    <>
      <HeroSection 
        icons={[FaUserTie, FaComments, FaRocket]}
        title="Contactez"
        accentWord="Moi"
        description="Prêt à collaborer sur votre prochain projet ? Discutons de vos idées et créons ensemble quelque chose d'extraordinaire. Je suis là pour transformer vos visions en réalité."
        className="to-accent/5 dark:to-accent/5"
      />

      <section className="py-16 lg:py-24">
        <div className="page-container">
          <AnimatedItem delay={200}>
            <div className="w-full mx-auto text-center mb-16 lg:mb-24">
              <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 p-8 lg:p-12 backdrop-blur-md">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="rounded-xl bg-gradient-to-br from-accent to-accent/80 p-4 text-light shadow-lg">
                    <FaClock className="h-6 w-6 lg:h-8 lg:w-8" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-primary dark:text-light">Temps de Réponse</h2>
                </div>
                <p className="text-justify text-lg lg:text-xl leading-relaxed text-primary/70 dark:text-light/70">
                  Je réponds généralement dans les <span className="font-semibold text-accent">24 heures</span>. Pour les urgences ou les projets urgents, n'hésitez pas à m'appeler directement ou à me contacter via WhatsApp.
                </p>
              </div>
            </div>
          </AnimatedItem>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 xl:gap-24">
            <div ref={contactInfoRef} className="space-y-10">
              <div className="text-center lg:text-left">
                <h2 className="mb-4 text-3xl font-bold text-primary dark:text-light md:text-4xl">Informations de Contact</h2>
                <p className="text-lg text-primary/70 dark:text-light/70">Voici mes coordonnées pour me joindre directement</p>
              </div>
              {useMemo(() => (
                <div className="space-y-8">
                  {contactInfo && contactInfo.length > 0 ? (
                    contactInfo.map((contact, index) => {
                      const getIcon = (type) => {
                        switch (type) {
                          case 'phone': return FaPhoneAlt;
                          case 'email': return FaEnvelope;
                          case 'whatsapp': return FaWhatsapp;
                          default: return FaPhoneAlt;
                        }
                      };
                      
                      const Icon = getIcon(contact.type);
                      const href = contact.type === 'email' ? `mailto:${contact.value}` : 
                                  contact.type === 'whatsapp' ? `https://wa.me/${contact.value.replace(/\D/g, '')}` : 
                                  `tel:${contact.value}`;
                      
                      return (
                        <ContactInfoCard
                          key={contact.id}
                          icon={Icon}
                          title={contact.title}
                          value={contact.value}
                          href={href}
                          delay={index * 200}
                        />
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-lg text-primary/70 dark:text-light/70">
                        Aucune information de contact disponible pour le moment.
                      </p>
                    </div>
                  )}
                </div>
              ), [contactInfo, contactInfoInView])}
            </div>

            <div ref={formRef} className={`${formInView ? "animate-fade-in" : "opacity-0"}`}>
              <div className="shadow-3xl relative overflow-hidden rounded-3xl border-2 border-accent/20 bg-gradient-to-br from-light/80 to-light/60 p-10 backdrop-blur-md dark:from-primary/80 dark:to-primary/60">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-accent/5 blur-xl" />
                <div className="relative z-10">
                  <div className="mb-10 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-primary dark:text-light md:text-4xl">Envoyez un Message</h2>
                    <p className="text-lg text-primary/70 dark:text-light/70">Partagez votre projet et je vous répondrai rapidement</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      {renderInput("text", "name", "Prénom & Nom")}
                      {renderInput("email", "email", "Email")}
                    </div>
                    {renderInput("text", "subject", "Sujet")}
                    {renderInput("text", "message", "Message", true)}
                    <button type="submit" disabled={isSubmitting} className="hover:shadow-3xl group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-accent/90 px-8 py-6 font-bold text-light shadow-2xl transition-all duration-500 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100" aria-label="Envoyer le message">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-light/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                      <div className="relative z-10 flex items-center justify-center gap-4">
                        {isSubmitting ? (
                          <>
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-light/30 border-t-light" />
                            <span className="text-lg">Envoi en cours...</span>
                          </>
                        ) : (
                          <>
                            <FaPaperPlane className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                            <span className="text-lg">Envoyer le Message</span>
                          </>
                        )}
                      </div>
                    </button>
                    {feedbackMessage && (
                      <div className={`flex items-center gap-4 rounded-2xl p-6 ${feedbackMessage.type === "success" ? "border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"} animate-fade-in`}>
                        {feedbackMessage.type === "success" ? (
                          <FaCheckCircle className="h-6 w-6 flex-shrink-0 text-green-500" />
                        ) : (
                          <FaExclamationCircle className="h-6 w-6 flex-shrink-0 text-red-500" />
                        )}
                        <p className={`text-base font-medium ${feedbackMessage.type === "success" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                          {feedbackMessage.text}
                        </p>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactClient;
