import consts from "@/consts";

const dp = (pic?: string) => {
    if (pic) {
        if (pic.includes("/static/"))
            pic = consts.API_URL + pic;
    } else {
        pic = "/usr_profile_pic.svg";
    }
    return pic;
};

export default dp;
