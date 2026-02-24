import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from "./routes";

function PixelRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    try {
      if (window.fbq) window.fbq("track", "PageView");
    } catch (e) {}
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  useEffect(() => {
    // Instala o Pixel só uma vez
    const script = document.createElement("script");
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1450461643272272');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }, []);

  return (
    <BrowserRouter>
      <PixelRouteTracker />
      <AppRoutes />
    </BrowserRouter>
  );
}
