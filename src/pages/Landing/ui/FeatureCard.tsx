interface FeatureCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  gradient: string;
}

export const FeatureCard = ({
  title,
  desc,
  icon,
  gradient,
}: FeatureCardProps) => {
  return (
    <div
      className={`p-8 rounded-3xl bg-gradient-to-br ${gradient} border border-white/80 shadow-lg flex flex-col items-center text-center hover:scale-105 hover:shadow-xl transition-all cursor-default group`}
    >
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-2 text-slate-800">{title}</h3>
      <p className="text-slate-600">{desc}</p>
    </div>
  );
};
