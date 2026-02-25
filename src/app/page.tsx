import { getDistricts, getCandidates } from "@/lib/data";
import DistrictHubClient from "@/components/DistrictHubClient";

export default function HomePage() {
    const districts = getDistricts();
    const candidates = getCandidates();

    return <DistrictHubClient districts={districts} candidates={candidates} />;
}
