import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Doctor Tracker",
  description: "Secure admin portal for doctors and patients",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen bg-slate-50 font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
