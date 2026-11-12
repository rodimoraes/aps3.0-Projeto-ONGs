import { MapPin, ExternalLink } from "lucide-react";

/**
 * Mapa do Google via iframe embed (sem necessidade de API key).
 * Usa a query "q" com o endereço completo da ONG.
 */
function MapaEndereco({ endereco, nomeOng }) {
  if (!endereco || !endereco.trim()) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
        <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-400">
          Endereço não informado — não é possível exibir o mapa.
        </p>
      </div>
    );
  }

  const query = encodeURIComponent(`${endereco}, Brasil`);
  const embedUrl = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <div className="space-y-3">
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        <iframe
          title={`Mapa de ${nomeOng || "ONG"}`}
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">{endereco}</span>
        </div>
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
        >
          <span>Abrir no Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export default MapaEndereco;
