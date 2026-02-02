export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-efc-gray-dark/20 border-t-efc-lime" />
      <p className="text-sm text-efc-gray-dark">Cargando...</p>
    </div>
  );
}
