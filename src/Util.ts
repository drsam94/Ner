
class Util {
    public static contains<T>(arr : T[], elem : T) : boolean {
        for (const obj of arr) {
            if (obj === elem) {
                return true;
            }
        }
        return false;
    }
}
