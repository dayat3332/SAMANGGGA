import type { JSX } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowLeft,
  faArrowRight,
  faBagShopping,
  faBars,
  faBasketShopping,
  faBell,
  faBoxesStacked,
  faChartLine,
  faCheck,
  faCircleCheck,
  faChevronRight,
  faClockRotateLeft,
  faCopy,
  faCreditCard,
  faEnvelope,
  faEye,
  faEyeSlash,
  faHeart as faHeartSolid,
  faHouse,
  faIndustry,
  faLocationDot,
  faLock,
  faMagnifyingGlass,
  faPenToSquare,
  faPhone,
  faPlus,
  faReceipt,
  faRecycle,
  faSeedling,
  faShieldHalved,
  faStore,
  faTableColumns,
  faTowerBroadcast,
  faTruckFast,
  faUser,
  faUserGear,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faWhatsapp,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

export interface IconProps {
  className?: string;
}

export function FaIcon({
  icon,
  className = "h-4 w-4",
}: {
  icon: IconDefinition;
  className?: string;
}): JSX.Element {
  const [width, height, , , svgPathData] = icon.icon;
  // Pastikan ikon selalu memiliki ukuran agar SVG tidak membesar memenuhi layar
  const hasSize = /(^|\s)(h|w|size)-/.test(className);
  const finalClassName = hasSize ? className : `h-4 w-4 shrink-0 ${className}`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="currentColor"
      className={finalClassName}
      aria-hidden="true"
    >
      {typeof svgPathData === "string" ? (
        <path d={svgPathData} />
      ) : (
        svgPathData.map((d, i) => <path key={i} d={d} />)
      )}
    </svg>
  );
}

export function MenuIcon({ open, className = "h-6 w-6" }: { open: boolean; className?: string }): JSX.Element {
  return <FaIcon icon={open ? faXmark : faBars} className={className} />;
}

export function XMarkIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faXmark} className={className} />;
}

export function SproutIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faSeedling} className={className} />;
}

export function StoreIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faStore} className={className} />;
}

export function FactoryIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faIndustry} className={className} />;
}

export function RecycleIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faRecycle} className={className} />;
}

export function BasketIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faBasketShopping} className={className} />;
}

export function ShoppingBagIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faBagShopping} className={className} />;
}

export function UserIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faUser} className={className} />;
}

export function UsersIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faUsers} className={className} />;
}

export function SearchIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faMagnifyingGlass} className={className} />;
}

export function MapPinIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faLocationDot} className={className} />;
}

export function HeartIcon({ filled, className = "h-5 w-5" }: { filled: boolean; className?: string }): JSX.Element {
  return <FaIcon icon={filled ? faHeartSolid : faHeartRegular} className={className} />;
}

export function CheckIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faCheck} className={className} />;
}

export function CheckBadgeIcon({ className = "h-3.5 w-3.5" }: IconProps): JSX.Element {
  return <FaIcon icon={faCircleCheck} className={className} />;
}

export function PlusIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faPlus} className={className} />;
}

export function ArrowRightIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faArrowRight} className={className} />;
}

export function ArrowLeftIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faArrowLeft} className={className} />;
}

export function ShieldCheckIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faShieldHalved} className={className} />;
}

export function TruckIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faTruckFast} className={className} />;
}

export function CreditCardIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faCreditCard} className={className} />;
}

export function CopyIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faCopy} className={className} />;
}

export function EditIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faPenToSquare} className={className} />;
}

export function LockIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faLock} className={className} />;
}

export function UserMailIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faEnvelope} className={className} />;
}

export function EyeIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faEye} className={className} />;
}

export function EyeOffIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faEyeSlash} className={className} />;
}

export function WhatsAppIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faWhatsapp} className={className} />;
}

export function PhoneIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faPhone} className={className} />;
}

export function ChevronRightIcon({ className = "h-3 w-3" }: IconProps): JSX.Element {
  return <FaIcon icon={faChevronRight} className={className} />;
}

export function YoutubeIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faYoutube} className={className} />;
}

export function FacebookIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faFacebook} className={className} />;
}

export function InstagramIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faInstagram} className={className} />;
}

export function TwitterIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faXTwitter} className={className} />;
}

export function LinkedinIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faLinkedin} className={className} />;
}

export function BoxesIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faBoxesStacked} className={className} />;
}

export function ReceiptIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faReceipt} className={className} />;
}

export function ChartLineIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faChartLine} className={className} />;
}

export function ClockRotateLeftIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faClockRotateLeft} className={className} />;
}

export function UserGearIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faUserGear} className={className} />;
}

export function HouseIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faHouse} className={className} />;
}

export function TableColumnsIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faTableColumns} className={className} />;
}

export function BellIcon({ className = "h-5 w-5" }: IconProps): JSX.Element {
  return <FaIcon icon={faBell} className={className} />;
}

export function SignalIcon({ className = "h-4 w-4" }: IconProps): JSX.Element {
  return <FaIcon icon={faTowerBroadcast} className={className} />;
}
