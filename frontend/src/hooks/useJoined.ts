import { fetcher } from "./useApi";
import useSWR from "swr";

const useJoined = () => {
    const { data: joined } = useSWR("me/communities", fetcher(1000));

    return joined;
};

export default useJoined;
