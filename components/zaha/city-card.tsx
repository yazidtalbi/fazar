import Image from "next/image";
import Link from "next/link";

interface CityCardProps {
  cityName: string;
  imagePath: string;
  href?: string;
  backgroundColor: string;
  textColor: string;
}

export function CityCard({ cityName, imagePath, href = "#", backgroundColor, textColor }: CityCardProps): React.ReactElement {
  return (
    <Link href={href} className="block group">
      <div 
        className="relative h-80 w-full overflow-hidden rounded-lg"
        style={{ backgroundColor }}
      >
        {/* Title */}
        <div className="px-6 pt-6 text-left" style={{ color: textColor }}>
          <div className="text-xl md:text-2xl font-semibold leading-tight">
            Ville de
          </div>
          <div className="text-xl md:text-2xl font-semibold leading-tight">
            {cityName}
          </div>
        </div>

        {/* Image */}
        <div
          className="absolute object-cover"
          style={{ left: "25.8%", top: "31.1%", width: "74%", height: "68.8%" }}
        >
          <Image
            src={imagePath}
            alt={cityName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 74vw"
          />
        </div>
      </div>
    </Link>
  );
}

