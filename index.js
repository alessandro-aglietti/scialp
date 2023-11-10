import { createHash } from "node:crypto";
import fs from "node:fs";
import imageUrls from "./imageUrls";
import axios from "axios";

async function retrieveImage(imageUrl) {
  const _ = {
    _: new Date(),
    imageUrlSha256: createHash("sha256").update(imageUrl).digest("hex"),
  };

  try {
    const response = await axios({
      method: "get",
      url: imageUrl,
      responseType: "stream",
    });

    _.responseAt = new Date();
    _.imageFileName = `${_.imageUrlSha256}.${imageUrl.slice(-3)}`;

    response.data.pipe(fs.createWriteStream(_.imageFileName));

    _.pipedAt = new Date();
  } catch (e) {
    _.e = e;
  }

  return _;
}

async function index() {
  const result = await Promise.all(
    imageUrls.map(async (image) => {
      const _ = await retrieveImage(image.url);
      return {
        ...image,
        ..._,
      };
    }),
  );

  console.log(result, new Date());

  return 0;
}

export default index;
