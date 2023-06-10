import scroll from "../utils/scroll.js";
import print from "../utils/print.js";
import save from "../utils/save.js";

const panklinik = async (cluster,page,positions,levels) => {
  try {
    page.setDefaultNavigationTimeout(0);
    let url = "https://www.pan-klinik.de/stellenangebote/";
    await page.goto(url, { timestamp: 0, waitUntil: "load" });

    await scroll(page);
    let links = await page.evaluate(() => {
      let halfJobs = Array.from(document.querySelectorAll(".bluetext > a")).map(
        (el) => el.href
      );
      let restHalf = Array.from(
        document.querySelectorAll(".inner > p > a")
      ).map((el) => el.href);

      let jobLinks = [];
      halfJobs.length > 0 ? jobLinks.push(...halfJobs) : (halfJobs = []);
      restHalf.length > 0 ? jobLinks.push(...restHalf) : (restHalf = []);
      return jobLinks;
    });
    let allJobs = [];
    for (let link of links) {
      cluster.queue(async ({ page }) => {
      let job = {
        title: "",
        location: "Köln",
        hospital: "PAN Klinik Am Neumarkt",
        link: "",
        level: "",
        position: "",
      };
      await page.goto(link, { timeout: 0, waitUntil: "load" });
      await page.waitForTimeout(5000);
      await scroll(page);
      job.title = await page.evaluate(() => {
        return document.querySelector("h1").innerText;
      });
      let text = await page.evaluate(() => {
        return document.body.innerText;
      });
      //get level
      let level = text.match(/Facharzt|Chefarzt|Assistenzarzt|Arzt|Oberarzt/);
      let position = text.match(/arzt|pflege/);
      job.level = level ? level[0] : "";
      if (
        level == "Facharzt" ||
        level == "Chefarzt" ||
        level == "Assistenzarzt" ||
        level == "Arzt" ||
        level == "Oberarzt"
      ) {
        job.position = "artz";
      }
      if (position == "pflege" || (position == "Pflege" && !level in levels)) {
        job.position = "pflege";
        job.level = "Nicht angegeben";
      }
     
      job.link = await page.evaluate(() => {
        return document.body.innerText.match(/\w+@.+\.\w/);
      });

      if (typeof job.link == "object") {
        job.link = job.link[0];
        }
        
        job.email = await page.evaluate(() => {
          return document.body.innerText.match(/\w+@.*\.\w/);
        });

        if (typeof job.email == "object") {
          job.email = job.email[0];
        }
        
      if(positions.map(el => el.position).includes(job.position)){
        await save(job);
      }
      });
    }

  } catch (err) {
    print(err);
  }
};


export default panklinik;
