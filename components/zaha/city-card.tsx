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
        className="relative h-36 md:h-80 w-full overflow-hidden arabic-frame will-change-transform transform-gpu"
        style={{ backgroundColor }}
      >
        {/* Title */}
        <div className="pl-6 pr-3 md:pl-10 md:pr-6 pt-3 md:pt-6 text-left" style={{ color: textColor }}>
          <div className="text-base md:text-2xl font-semibold leading-tight">
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

