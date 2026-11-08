import { Image, StyleSheet, View } from "react-native";

// A logo tem fundo branco; no tema escuro ela fica dentro de um "cartão" branco.
export function Logo({ tamanho = 220 }: { tamanho?: number }) {
  return (
    <View style={[styles.cartao, { width: tamanho + 24 }]}>
      <Image
        source={require("../../assets/images/logo.jpg")}
        style={{ width: tamanho, height: tamanho * 0.8 }}
        resizeMode="contain"
        accessibilityLabel="Logo da Perfformance Academia"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 8,
  },
});
