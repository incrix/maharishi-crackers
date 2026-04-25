"use client";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { CallButton, WhatsappButton } from "./clientComp";
import ContactPng from "@/public/Images/contactImage.png";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function ContactPage() {
  return (
    <Stack sx={{ px: { xs: 3, md: 8 }, mx: "auto", maxWidth: "1400px", mt: { xs: 12, md: 12 } }}>
      <Stack sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: { xs: "0 10px", md: "0 40px" } }}>
        <Stack sx={{ width: "100%", maxWidth: "100%", padding: "40px 0", gap: 16 }}>
          <AddressComponent />
          <ContactForm />
        </Stack>
      </Stack>
    </Stack>
  );
}

function AddressComponent() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const handlePhoneCallOne = () => { window.location.href = "tel:7548820326"; };
  const handlePhoneCallTwo = () => { window.location.href = "tel:9361592454"; };

  return (
    <Stack ref={ref} direction={{ sm: "column", md: "row" }} gap={8}>
      <motion.div initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }} style={{ flex: 1 }}>
        <Stack gap={6}>
          <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 700, color: "var(--primary)" }}>
            Contact <Box component="span" sx={{ color: "var(--secondary)" }}>Us</Box>
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} gap={4}>
            <Stack gap={2}>
              <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--primary)", fontWeight: 700 }}>Office</Typography>
              <Typography sx={{ fontSize: 16, color: "#666", lineHeight: 1.8 }}>
                Sivakasi, Tamil Nadu, India.
              </Typography>
              <Typography sx={{ fontSize: 16, color: "#666" }}>
                Email: <span style={{ cursor: "pointer", color: "var(--primary)" }}>info@maharishicrackers.com</span>
              </Typography>
              <Typography sx={{ fontSize: 16, color: "#666" }}>
                Ph: <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={handlePhoneCallOne}>+91 75488 20326</span>
                <br />&emsp;
                <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={handlePhoneCallTwo}>+91 93615 92454</span>
              </Typography>
            </Stack>
          </Stack>
          <Stack gap={1.5} direction={{ xs: "column", sm: "row" }}>
            <CallButton />
            <WhatsappButton />
          </Stack>
        </Stack>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} style={{ flex: 1 }}>
        <Box sx={{ borderRadius: "16px", overflow: "hidden", border: "2px solid var(--border)", height: { xs: "350px", md: "450px" } }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7872.505316576842!2d77.88975119044709!3d9.39921096271045!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cb0d81dc284f%3A0x56f61e3b30aa9a2d!2sMettamalai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1756360756693!5m2!1sen!2sin"
            width="100%" height="100%" style={{ border: 0 }} loading="lazy"
          ></iframe>
        </Box>
      </motion.div>
    </Stack>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const handleChange = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "12px", "&:hover fieldset": { borderColor: "var(--primary)" }, "&.Mui-focused fieldset": { borderColor: "var(--primary)" } } };

  return (
    <Stack ref={ref} direction={{ sm: "column", md: "row" }} gap={6}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ flex: 1.5 }}>
        <Stack gap={4}>
          <Stack>
            <Typography sx={{ fontSize: 18, color: "var(--secondary)", fontWeight: 700 }}>Wholesalers Contact Form</Typography>
            <Typography sx={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: { xs: 28, md: 36 }, color: "var(--primary)" }}>Drop Us a Line</Typography>
            <Typography sx={{ color: "#aaa", fontSize: 13 }}>Your email address will not be published.</Typography>
          </Stack>
          <Stack gap={2}>
            <Stack direction="row" gap={2}>
              <TextField fullWidth placeholder="Name" value={formData.name} onChange={handleChange("name")} sx={textFieldSx} />
              <TextField fullWidth placeholder="Email" value={formData.email} onChange={handleChange("email")} sx={textFieldSx} />
            </Stack>
            <Stack direction="row" gap={2}>
              <TextField fullWidth placeholder="Phone" value={formData.phone} onChange={handleChange("phone")} sx={textFieldSx} />
              <TextField fullWidth placeholder="Company" value={formData.company} onChange={handleChange("company")} sx={textFieldSx} />
            </Stack>
            <TextField placeholder="Message" multiline rows={4} value={formData.message} onChange={handleChange("message")} sx={textFieldSx} />
            <Button variant="contained" sx={{ background: "var(--primary)", height: 50, textTransform: "none", color: "#fff", borderRadius: "12px", fontWeight: 600, "&:hover": { background: "var(--primary)", opacity: 0.9 } }}>
              Send Message
            </Button>
          </Stack>
        </Stack>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} style={{ flex: 1 }}>
        <Image width={500} height={500} src={ContactPng.src} alt="Contact illustration" style={{ width: "100%", height: "auto" }} />
      </motion.div>
    </Stack>
  );
}
