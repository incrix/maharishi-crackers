"use client";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";

export default function HeroCarousel() {
  const isMobile = useMediaQuery("(max-width:600px)");

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    fade: true,
    cssEase: "cubic-bezier(0.7, 0, 0.3, 1)",
  };

  const images = isMobile
    ? [
        { src: "https://e-com.incrix.com/Radhey/mobileBanner1.png", alt: "Mobile Banner 1" },
        { src: "https://e-com.incrix.com/Radhey/mobileBanner2.png", alt: "Mobile Banner 2" },
      ]
    : [
        { src: "https://e-com.incrix.com/Radhey/banner1.png", alt: "Banner 1" },
        { src: "https://e-com.incrix.com/Radhey/banner2.png", alt: "Banner 2" },
      ];

  return (
    <Stack sx={{ position: "relative", height: "100vh", minHeight: "700px", overflow: "hidden" }}>
      {/* Carousel — full viewport */}
      <Box sx={{ position: "absolute", inset: 0 }}>
        <Slider {...settings}>
          {images.map((image, index) => (
            <div key={index}>
              <Box sx={{ position: "relative", width: "100%", height: "100vh", minHeight: "700px" }}>
                <Image
                  fill
                  src={image.src}
                  alt={image.alt}
                  style={{ objectFit: "cover" }}
                  priority={index === 0}
                  sizes="100vw"
                />
              </Box>
            </div>
          ))}
        </Slider>
      </Box>

      {/* Thin bottom accent line */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "var(--gold-gradient)",
          zIndex: 3,
        }}
      />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
        }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Box
            sx={{
              width: 24,
              height: 40,
              borderRadius: "12px",
              border: "2px solid rgba(255,255,255,0.3)",
              display: "flex",
              justifyContent: "center",
              pt: 1,
            }}
          >
            <Box
              sx={{
                width: 3,
                height: 8,
                borderRadius: "2px",
                background: "var(--secondary-light)",
              }}
            />
          </Box>
        </motion.div>
      </motion.div>

      {/* Dots and carousel styles */}
      <style jsx global>{`
        .slick-slide > div {
          display: flex;
        }
        .slick-dots {
          position: absolute;
          bottom: 40px;
          right: 40px;
          left: auto;
          width: auto;
          z-index: 4;
        }
        .slick-dots li {
          margin: 0 4px;
        }
        .slick-dots li button:before {
          font-size: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.35);
          content: '';
          display: block;
          transition: all 0.3s ease;
        }
        .slick-dots li.slick-active button:before {
          background: var(--secondary-light);
          width: 24px;
          border-radius: 4px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </Stack>
  );
}
