import { useState, type FC, type FormEvent } from "react";
import { Eye } from "lucide-react";
import { MascotSprite } from "../common/MascotSprite";

interface LoginScreenProps {
  /** Signs in to the existing profile (no credentials are checked) */
  onLogin: () => void;
}

const SOCIAL_LOGINS = [
  { id: "facebook", label: "Continue with Facebook", icon: "/assets/login/facebook.svg", size: 38 },
  { id: "google", label: "Continue with Google", icon: "/assets/login/google.svg", size: 41 },
  { id: "whatsapp", label: "Continue with WhatsApp", icon: "/assets/login/whatsapp.svg", size: 44 },
];

/** Login page from Figma node 161:15767. Every action logs in to the existing profile. */
export const LoginScreen: FC<LoginScreenProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="relative w-full h-full overflow-y-auto no-scrollbar bg-white flex flex-col">
      {/* Top space with the mascot peeking over the card */}
      <div className="relative grow-0 shrink basis-[265px] min-h-[141px]">
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[22px] z-10">
          <MascotSprite pose="peek" alt="HYO mascot peeking" />
        </div>
      </div>

      {/* Card. Vertical gaps match Figma on a 956px-tall screen and shrink on shorter
          screens (clamp(min, F/756*100dvh - F*200/756, F)) so the page fits without scrolling. */}
      <section
        aria-label="Login"
        className="relative grow shrink-0 w-full overflow-hidden rounded-t-[35px] border border-b-0 border-[rgba(219,234,254,0.6)] bg-gradient-to-b from-[#e8f1fc] via-[#f1f6ff] to-white shadow-[0px_10px_28px_-6px_rgba(37,99,235,0.08)] px-[15px] pt-[clamp(16px,calc(4.365dvh-8.73px),33px)] pb-[clamp(16px,calc(4.762dvh-9.52px),36px)] flex flex-col"
      >
        {/* Ambient glow */}
        <div aria-hidden="true" className="absolute left-[220px] -top-[41px] size-[160px] rounded-full bg-[rgba(191,219,254,0.4)] blur-[20px] pointer-events-none" />
        <div aria-hidden="true" className="absolute -left-6 top-[157px] size-[144px] rounded-full bg-[rgba(224,242,254,0.5)] blur-[12px] pointer-events-none" />

        {/* Heading */}
        <div className="relative w-[198px] flex flex-col items-center gap-[15px] font-['Inter'] font-bold">
          <h1 className="w-full text-[31px] leading-[1.2] text-[#005ab6]">Hello!</h1>
          <p className="w-full text-[20px] leading-[normal] text-black text-center">
            Login to Get Started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative mt-[clamp(18px,calc(4.894dvh-9.79px),37px)] flex flex-col">
          {/* Username / Email */}
          <label className="h-[54px] w-full rounded-[25.5px] border border-[#005ab6] pl-[21px] pr-4 flex items-center gap-[7px] focus-within:ring-2 focus-within:ring-[#005ab6]/20">
            <img src="/assets/login/email.svg" alt="" width={26} height={26} className="shrink-0" />
            <input
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username / Email"
              aria-label="Username or email"
              className="flex-1 min-w-0 bg-transparent font-['Inter'] font-semibold text-[16px] text-black placeholder-[#b7b7b7] focus:outline-none"
            />
          </label>

          {/* Password */}
          <label className="mt-[clamp(18px,calc(4.894dvh-9.79px),37px)] h-[54px] w-full rounded-[25.5px] border border-[#005ab6] pl-[19px] pr-3 flex items-center gap-[7px] focus-within:ring-2 focus-within:ring-[#005ab6]/20">
            <img src="/assets/login/password.svg" alt="" width={26} height={26} className="shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              aria-label="Password"
              className="flex-1 min-w-0 bg-transparent font-['Inter'] font-semibold text-[16px] text-black placeholder-[#b7b7b7] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="relative size-[31px] shrink-0 cursor-pointer"
            >
              {showPassword ? (
                <Eye className="absolute inset-0 m-auto size-[28px] text-[#005ab6]" />
              ) : (
                <img
                  src="/assets/login/eye-off.svg"
                  alt=""
                  width={28.4167}
                  height={24.5417}
                  className="absolute left-[4.17%] top-[12.5%]"
                />
              )}
            </button>
          </label>

          <button
            type="submit"
            className="mt-[clamp(14px,calc(3.571dvh-7.14px),27px)] h-[54px] w-full rounded-[27px] bg-[#005ab6] font-['Inter'] font-bold text-[16px] text-white hover:bg-[#004a96] active:scale-[0.99] transition-all"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="relative mt-[clamp(14px,calc(3.571dvh-7.14px),27px)] flex items-center gap-6" aria-hidden="true">
          <img src="/assets/login/divider-line.svg" alt="" className="flex-1 min-w-0 h-px" />
          <span className="font-['Inter'] font-bold text-[20px] leading-[normal] text-[#b7b7b7]">or</span>
          <img src="/assets/login/divider-line.svg" alt="" className="flex-1 min-w-0 h-px" />
        </div>

        {/* Social logins */}
        <div className="relative mt-[clamp(12px,calc(3.307dvh-6.61px),25px)] flex items-center justify-center gap-[25px]">
          {SOCIAL_LOGINS.map((social) => (
            <button
              key={social.id}
              type="button"
              onClick={onLogin}
              aria-label={social.label}
              title={social.label}
              className="size-[60px] rounded-[30px] border border-[#b7b7b7] flex items-center justify-center hover:bg-white/70 active:scale-95 transition-all"
            >
              <img src={social.icon} alt="" width={social.size} height={social.size} />
            </button>
          ))}
        </div>

        {/* Sign up */}
        <p className="relative mt-auto pt-[clamp(16px,calc(5.291dvh-10.58px),40px)] flex items-center justify-center gap-2 font-['Inter'] font-semibold text-[16px]">
          <span className="text-black">Don’t have account?</span>
          <button type="button" onClick={onLogin} className="text-[#005ab6] hover:underline">
            Sign up
          </button>
        </p>
      </section>
    </div>
  );
};
