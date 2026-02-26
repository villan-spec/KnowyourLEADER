import { DATA_SOURCES } from "@/lib/data";
import { getDistricts, getCandidates } from "@/lib/data.server";
import DistrictHubClient from "@/components/DistrictHubClient";

export default function HomePage() {
    const districts = getDistricts();
    const candidates = getCandidates();

    return <DistrictHubClient districts={districts} candidates={candidates} dataSources={DATA_SOURCES} />;
}
