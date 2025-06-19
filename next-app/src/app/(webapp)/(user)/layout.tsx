import Footer from "@/components/navigation/home/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<main className="overflow-hidden min-vh-100 pt-5 d-flex flex-column">
			<div className="container h-100 d-flex flex-column flex-grow-1">
				<div className="row justify-content-center align-items-center flex-grow-1">{children}</div>
			</div>
			<Footer />
		</main>
	);
}
