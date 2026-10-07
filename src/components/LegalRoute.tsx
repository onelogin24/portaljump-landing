import { LegalPage } from "./LegalPage";
import privacy from "../content/legal/privacy.md?raw";
import terms from "../content/legal/terms.md?raw";

export default function LegalRoute({ which }: { which: "privacy" | "terms" }) {
  return which === "privacy" ? (
    <LegalPage title="Privacy Policy" source={privacy} />
  ) : (
    <LegalPage title="Terms of Use" source={terms} />
  );
}
