import { useState, useEffect } from "react";
import "./App.css";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Star, GitFork, CircleDot } from "lucide-react";
import { Octokit } from "octokit";

interface Lang {
  title: string;
  value: string;
}

interface LangColor {
  color: string;
  url: string;
}

interface Repo {
  html_url: string;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks: number;
  open_issues: number;
}

interface State {
  type: string;
  message: string;
}

function App() {
  const [langs, setLangs] = useState<Lang[]>([]);
  const [langColors, setLangsColors] = useState<{ [key: string]: LangColor }>(
    {},
  );
  const [searchLang, setSearchLang] = useState<string>("");
  const [state, setState] = useState<State>({
    type: "EMPTY",
    message: "Please Select a Language",
  });
  const [repo, setRepo] = useState<Repo | null>(null);

  const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
  });

  async function fetchRepos(lang: string) {
    setRepo(null);
    const {
      data: { items },
      status,
    } = await octokit.request(
      `GET /search/repositories?q=""+language:${lang}&per_page=100&sort=help-wanted-issues&order=asc`,
      {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (status == 200) {
      setState({ type: "SUCCESS", message: "" });
      setRepo(items[Math.floor(Math.random() * items.length)]);
    }
  }
  useEffect(() => {
    async function fetchLanguage() {
      const languages = await axios.get<Lang[]>(
        "https://raw.githubusercontent.com/kamranahmedse/githunt/master/src/components/filters/language-filter/languages.json",
      );
      const colors = await axios.get<{ [key: string]: LangColor }>(
        "https://raw.githubusercontent.com/ozh/github-colors/refs/heads/master/colors.json",
      );
      const filteredLangs = languages.data.filter(
        (lang: Lang) => lang.value !== "",
      );
      setLangs(filteredLangs);
      setLangsColors(colors.data);
    }
    fetchLanguage();
  }, []);
  return (
    <div className="main_body">
      <div className="flex flex-col gap-10 items-center w-auto">
        <h1 className="font-bold">GitHub Repository Finder</h1>
        <Select
          value={searchLang}
          onValueChange={(value) => {
            setSearchLang(value);
            setState({ type: "LOADING", message: "Loading, Please Wait" });
            fetchRepos(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {langs.map((lang: Lang, index: number) => (
                <SelectItem key={index} value={lang.value}>
                  {lang.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <h4>{state.message}</h4>
        {repo && (
          <div className="flex flex-col gap-2 w-full">
            <a href={repo?.html_url} target="_blank">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>{repo?.name}</CardTitle>
                  <CardDescription>{repo?.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <div className="flex gap-1.5 items-center">
                      <div
                        style={{
                          backgroundColor:
                            langColors[repo?.language].color || "gray",
                          width: 20,
                          height: 20,
                          borderRadius: 20 + "rem",
                        }}
                      ></div>
                      <p>{repo?.language}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Star />
                      <p>{repo?.stargazers_count}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <GitFork />
                      <p>{repo?.forks}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <CircleDot />
                      <p>{repo?.open_issues}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
            <Button
              onClick={() => {
                setState({
                  type: "EMPTY",
                  message: "Please Select a Language",
                });
                setSearchLang("");
                setRepo(null);
              }}
            >
              Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
