import { Droplets, Route, Stethoscope, GraduationCap, Briefcase, Building2, Waves, Landmark, TreePine, Truck, ShieldAlert, Home, Trash2, Sprout } from "lucide-react";

const ISSUE_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
    Water: Droplets,
    Roads: Route,
    Healthcare: Stethoscope,
    Education: GraduationCap,
    Employment: Briefcase,
    Infrastructure: Building2,
    Fishing: Waves,
    Heritage: Landmark,
    "Temple Heritage": Landmark,
    Agriculture: Sprout,
    Transport: Truck,
    "Women Safety": ShieldAlert,
    Housing: Home,
    Sanitation: Trash2,
    Sewage: Trash2,
    Drainage: Droplets,
};

interface IssueTagProps {
    issue: string;
}

export default function IssueTag({ issue }: IssueTagProps) {
    const IconComponent = ISSUE_ICONS[issue] || Building2;

    return (
        <span className="issue-tag">
            <IconComponent size={12} strokeWidth={2} />
            {issue}
        </span>
    );
}
