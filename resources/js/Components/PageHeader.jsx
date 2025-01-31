import { MagnifyingGlassIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { Link } from "@inertiajs/react";
import {
    Button,
    CardHeader,
    Input,
    Typography,
} from "@material-tailwind/react";

export default function PageHeader({
    handleSearch,
    title,
    description,
    buttonLabel,
    icon,
    showSearch = true,
    addRoute = "users",
    hasFilter = false,
    label = "Search",
    showAddButton = true,
}) {
    return (
        <CardHeader
            floated={false}
            shadow={false}
            className="rounded-none ml-[0rem]"
        >
            <div className="flex items-center justify-between gap-8 mb-8 border-b-2 border-primaryHover">
                <div className="flex items-center justify-between gap-8 mb-8">
                    <div>
                        <Typography variant="h5" className="text-primary">
                            {title}
                        </Typography>
                        <Typography className="mt-1 font-normal text-primary">
                            {description}
                        </Typography>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 sm:flex-row "></div>
                </div>
            </div>
            {showSearch ? (
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row tablet:items-start">
                    <div
                        className={
                            hasFilter
                                ? "w-[21rem] tablet:w-full"
                                : "w-full md:w-72 border"
                        }
                    >
                        <Input
                            label={label}
                            icon={<MagnifyingGlassIcon className="w-5 h-5 " />}
                            onChange={handleSearch}
                        />
                    </div>
                    {showAddButton ? (
                        <Link href={route(addRoute)} className=" mobile:w-full">
                            <Button
                                className="flex items-center gap-3 bg-green-500 mobile:justify-center mobile:mt-2 mobile:w-full"
                                variant="filled"
                                size="md"
                            >
                                {icon} {buttonLabel}
                            </Button>
                        </Link>
                    ) : null}
                </div>
            ) : null}
        </CardHeader>
    );
}
