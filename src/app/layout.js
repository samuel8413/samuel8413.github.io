import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Invitación a mi fiesta | Diana",
  description: "Invitación a mi fiesta",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Arsenal:ital,wght@0,400;0,700;1,400;1,700&family=Marck+Script&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={inter.className}
        style={{ backgroundColor: "white", margin: "0", padding: "0" }}
      >
        {children}
      </body>
    </html>
  );
}
