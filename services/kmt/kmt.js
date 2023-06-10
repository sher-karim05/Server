import scroll from "../../utils/scroll.js";
import print from "../../utils/print.js";
import save from "../../utils/save.js";

let kmt = async (cluster,page, positions, levels) => {
  try {
   
    await page.goto("https://www.kmt-hamm.de/karriere", {
      waitUntil: "load",
      timeout: 0,
    });
    //scroll the page
    await scroll(page);
    await page.waitForTimeout(1000);
    //get all jobLinks
    let jobLinks = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("span.field-content > a")
      ).map((el) => el.href);
    });
    let counter = 0;
    //   await page.waitForSelector('.field-content > a > font font')
    let titles = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(".field-content > a > font > font ")
      ).map((el) => el.innerText);
    });

    console.log(jobLinks);
    console.log(titles);

    let allJobs = [];

    for (let jobLink of jobLinks) {
      cluster.queue(async ({ page }) => {
        let job = {
          title: "",
          location: "59071 Hamm",
          hospital: "Klinik für mänvelle Therapie",
          city: "Hamm",
          link: "",
          level: "",
          email: "",
          position: "",
          republic: "North Rhine-Westphalia",
        };
        await page.goto(jobLink, {
          waitUntil: "load",
          timeout: 0,
        });

        await page.waitForTimeout(1000);
        //get title

        let title = await page.evaluate(() => {
          let ttitle = document.querySelector("span.field-content > a > font");
          return ttitle ? ttitle.innerText : "";
        });
        job.title = title;

        let text = await page.evaluate(() => {
          return document.body.innerText;
        });
        //get email
        let email = await page.evaluate(() => {
          return document.body.innerText.match(/\w+\@\w+\-\w+.\w+/) || "N/A";
        });
        job.email = String() + email;
        //apply link
        job.link = jobLink;
        //get level
        let level = text.match(/Facharzt|Chefarzt|Assistenzarzt/);
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

         if (positions.map(el => el.toLowerCase()).includes(job.position.toLowerCase())) {
            await save(job);
          }
      });
    }
   
  } catch (e) {
    print(e);
  }
};

export default kmt;
