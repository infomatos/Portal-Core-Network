import dashboardHtml from "../dashboard_servidores_reuso_2026 1.html?raw";

export default function ReusoHardware() {
  const workbookUrl = `${import.meta.env.BASE_URL}dados/BASE_SERVIDORES_REUSO_2026.xlsx`;
  const html = dashboardHtml.replace("__REUSO_WORKBOOK_URL__", workbookUrl);

  return (
    <div className="h-full min-h-[calc(100vh-8rem)] bg-slate-100">
      <iframe
        title="Dashboard Executivo - Base de Servidores e Reuso 2026"
        srcDoc={html}
        className="block h-full min-h-[calc(100vh-8rem)] w-full border-0"
      />
    </div>
  );
}
