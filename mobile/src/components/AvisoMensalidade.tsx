import type { Mensalidade } from "@/models";
import { statusCores } from "@/theme";
import { formatarMoeda, isoParaBr } from "@/utils/formatacao";
import { Banner } from "react-native-paper";

// Aviso de pagamento: aparece quando a mensalidade está para vencer ou atrasada.
export function AvisoMensalidade({ mensalidade, onVerDetalhes }: { mensalidade: Mensalidade | null; onVerDetalhes?: () => void }) {
  if (!mensalidade || (mensalidade.status !== "A_VENCER" && mensalidade.status !== "ATRASADA")) return null;

  const atrasada = mensalidade.status === "ATRASADA";
  const dias = Math.abs(mensalidade.diasParaVencer);
  const texto = atrasada
    ? `Sua mensalidade de ${formatarMoeda(mensalidade.valor)} venceu em ${isoParaBr(mensalidade.vencimento)} (${dias} dia(s) de atraso). Procure a recepção.`
    : mensalidade.diasParaVencer === 0
      ? `Sua mensalidade de ${formatarMoeda(mensalidade.valor)} vence hoje.`
      : `Sua mensalidade de ${formatarMoeda(mensalidade.valor)} vence em ${dias} dia(s) (${isoParaBr(mensalidade.vencimento)}).`;

  return (
    <Banner
      visible
      icon={atrasada ? "alert-circle" : "calendar-alert"}
      style={{ backgroundColor: atrasada ? "#FFDAD7" : "#FFF1D6" }}
      theme={{ colors: { onSurface: "#2B2B2B", primary: atrasada ? statusCores.erro : "#8A5100" } }}
      actions={onVerDetalhes ? [{ label: "Ver detalhes", onPress: onVerDetalhes }] : []}
    >
      {texto}
    </Banner>
  );
}
