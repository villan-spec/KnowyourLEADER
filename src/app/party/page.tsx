import { getParties } from "@/lib/data.server";
import PartyCard from "@/components/PartyCard";

export default function PartyIndexPage() {
    const parties = getParties();

    return (
        <main className="min-h-screen">
            <section className="container-app py-10 sm:py-16">
                <div className="mb-12 animate-fade-in">
                    <h1 className="mb-4">Party Audit</h1>
                    <p className="text-secondary max-w-2xl">
                        Explore the transparency and profile of political parties contesting in the Tamil Nadu 2026 Elections.
                        View aggregated data on wealth, criminal records, and candidate demographics.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parties.map((party, index) => (
                        <div key={party.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                            <PartyCard party={party} />
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
